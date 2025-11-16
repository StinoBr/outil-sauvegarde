import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import type { PlanSauvegarde, SGBDCible, DestinationStockage } from '@prisma/client';
import { db, StatutOperation, TypeSGBD } from '../utils/db';
import { executeStreamCommand, type ShellResult } from '../utils/process';
import { ensureFileDirectory, getFileSize } from '../utils/fileSystem';
import { compressFile, type CompressionFormat } from '../utils/compression';
import { uploadToAzure, uploadToGcp, uploadToS3 } from '../utils/storage';
import { logger } from '../utils/logger';
import { buildStrategy } from '../strategies/strategyFactory';
import type { BackupVariant } from '../strategies/types';
import { appConfig } from '../config/appConfig';
import { storageConfig } from '../config/storageConfig';

export type BackupOptions = {
  variant?: BackupVariant;
  compressionFormat?: CompressionFormat;
  uploadToCloud?: boolean;
  cloudProvider?: 's3' | 'azure' | 'gcp';
};

type PlanWithRelations = PlanSauvegarde & {
  sgbdCible: SGBDCible;
  destination: DestinationStockage;
};

export class BackupService {
  async executeBackup(planId: number, options: BackupOptions = {}): Promise<ShellResult> {
    const plan = await db.planSauvegarde.findUnique({
      where: { id: planId },
      include: { sgbdCible: true, destination: true },
    });

    if (!plan) {
      throw new Error(`Plan ${planId} introuvable`);
    }

    const journal = await db.journalSauvegarde.create({
      data: {
        planId,
        statut: StatutOperation.EnCours,
        heureDebut: new Date(),
        messageLog: `Plan ${plan.nomPlan}`,
      },
    });

    try {
      const variant = this.resolveVariant(plan, options.variant);
      const compression = this.resolveCompression(plan, options.compressionFormat);
      const { rawPath, finalPath } = await this.runBackup(plan, variant, compression);

      const fileSize = await getFileSize(finalPath);
      const duration = this.computeDuration(journal.heureDebut, new Date());

      const uploadResults = await this.pushToCloudIfNeeded(plan, finalPath, options);

      await db.journalSauvegarde.update({
        where: { id: journal.id },
        data: {
          statut: StatutOperation.Succes,
          heureFin: new Date(),
          dureeSecondes: duration,
          tailleFichierOctet: BigInt(fileSize),
          cheminFichierLocal: finalPath,
          messageLog: JSON.stringify({ variant, compression, uploads: uploadResults }),
        },
      });

      if (rawPath !== finalPath) {
        await unlink(rawPath).catch(() => undefined);
      }

      logger.info({ planId, variant, compression, finalPath }, 'Sauvegarde terminée');
      return { success: true };
    } catch (error: any) {
      logger.error({ planId, error }, 'Sauvegarde échouée');
      await db.journalSauvegarde.update({
        where: { id: journal.id },
        data: {
          statut: StatutOperation.Echec,
          heureFin: new Date(),
          messageLog: error.message || 'Erreur inconnue',
        },
      });
      return { success: false, error: error.message };
    }
  }

  private async runBackup(
    plan: PlanWithRelations,
    variant: BackupVariant,
    compression: CompressionFormat,
  ): Promise<{ rawPath: string; finalPath: string }> {
    const strategy = buildStrategy(plan.sgbdCible.typeSgbd);
    const command = await strategy.buildBackupCommand(plan.sgbdCible, variant);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseExtension = this.resolveBaseExtension(plan.sgbdCible.typeSgbd);
    const fileName = `backup-${plan.id}-${variant}-${timestamp}.${baseExtension}`;
    const rawPath = join(plan.destination.cheminLocal, fileName);

    await ensureFileDirectory(rawPath);

    const result = await executeStreamCommand(
      command.command,
      command.args,
      rawPath,
      command.env,
      false,
    );

    if (!result.success) {
      throw new Error(result.error || 'Erreur durant la sauvegarde');
    }

    if (compression === 'none') {
      return { rawPath, finalPath: rawPath };
    }

    const compressedPath = `${rawPath}.${this.getCompressionExtension(compression)}`;
    const finalPath = await compressFile(rawPath, compressedPath, compression);
    return { rawPath, finalPath };
  }

  private resolveVariant(plan: PlanWithRelations, override?: BackupVariant): BackupVariant {
    if (override) {
      if (!storageConfig.supportedBackupTypes.includes(override)) {
        throw new Error(`Type de sauvegarde non supporté: ${override}`);
      }
      return override;
    }
    const normalized = plan.typeSauvegarde?.toLowerCase();
    if (normalized === 'incremental') return 'incremental';
    if (normalized === 'differential') return 'differential';
    return 'full';
  }

  private resolveCompression(plan: PlanWithRelations, override?: CompressionFormat): CompressionFormat {
    if (!plan.compressionActivee) {
      return 'none';
    }
    if (override) {
      if (!storageConfig.supportedCompressors.includes(override)) {
        throw new Error(`Compression non supportée: ${override}`);
      }
      return override;
    }
    return appConfig.defaultCompression as CompressionFormat;
  }

  private resolveBaseExtension(type: TypeSGBD): string {
    switch (type) {
      case TypeSGBD.PostgreSQL:
        return 'dump';
      case TypeSGBD.MongoDB:
        return 'archive';
      case TypeSGBD.SQLite:
        return 'sqlite';
      default:
        return 'sql';
    }
  }

  private getCompressionExtension(format: CompressionFormat): string {
    switch (format) {
      case 'gzip':
        return 'gz';
      case 'tar.gz':
        return 'tar.gz';
      case 'zip':
        return 'zip';
      default:
        return '';
    }
  }

  private async pushToCloudIfNeeded(
    plan: PlanWithRelations,
    finalPath: string,
    options: BackupOptions,
  ) {
    const provider = (options.cloudProvider || plan.destination.cloudProvider || '').toLowerCase();
    if (!provider || (!plan.destination.cloudProvider && !options.uploadToCloud && !options.cloudProvider)) {
      return null;
    }

    switch (provider) {
      case 's3':
        return await uploadToS3(finalPath);
      case 'azure':
        return await uploadToAzure(finalPath);
      case 'google':
      case 'gcp':
        return await uploadToGcp(finalPath);
      default:
        logger.warn({ provider }, 'Provider cloud inconnu, aucun upload effectué');
        return null;
    }
  }

  private computeDuration(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 1000);
  }
}

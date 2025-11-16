import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import type { JournalSauvegarde, PlanSauvegarde, SGBDCible } from '@prisma/client';
import { db, StatutOperation } from '../utils/db';
import { executeStreamInCommand } from '../utils/process';
import { logger } from '../utils/logger';
import { buildStrategy } from '../strategies/strategyFactory';
import { decompressFile, type CompressionFormat } from '../utils/compression';
import { appConfig } from '../config/appConfig';

export type RestoreOptions = {
  compressionFormat?: CompressionFormat;
  filePath?: string;
};

type JournalWithPlan = JournalSauvegarde & {
  plan: PlanSauvegarde & { sgbdCible: SGBDCible };
};

export class RestoreService {
  async executeRestore(journalId: number, options: RestoreOptions = {}) {
    const journal = await db.journalSauvegarde.findUnique({
      where: { id: journalId },
      include: { plan: { include: { sgbdCible: true } } },
    }) as JournalWithPlan | null;

    if (!journal) {
      throw new Error(`Journal ${journalId} introuvable`);
    }
    if (journal.statut !== StatutOperation.Succes) {
      throw new Error('Impossible de restaurer depuis une sauvegarde en échec.');
    }

    const restoreRecord = await db.journalRestauration.create({
      data: {
        sauvegardeId: journal.id,
        statut: StatutOperation.EnCours,
        heureDebut: new Date(),
      },
    });

    try {
      const filePath = options.filePath || journal.cheminFichierLocal;
      if (!filePath) {
        throw new Error('Chemin de fichier introuvable pour cette sauvegarde.');
      }

      const compression = options.compressionFormat || this.detectCompression(filePath);
      const strategy = buildStrategy(journal.plan.sgbdCible.typeSgbd);
      const command = await strategy.buildRestoreCommand(journal.plan.sgbdCible);

      const preparedFile = await this.prepareFileForRestore(filePath, compression);
      const useDecompressionStream = compression === 'gzip' && preparedFile === filePath;

      const result = await executeStreamInCommand(
        command.command,
        command.args,
        preparedFile,
        command.env,
        useDecompressionStream,
      );

      if (!result.success) {
        throw new Error(result.error || 'Erreur durant la restauration');
      }

      if (preparedFile !== filePath) {
        await unlink(preparedFile).catch(() => undefined);
      }

      await db.journalRestauration.update({
        where: { id: restoreRecord.id },
        data: {
          statut: StatutOperation.Succes,
          heureFin: new Date(),
          messageLog: `Restauration depuis ${filePath}`,
        },
      });

      logger.info({ journalId }, 'Restauration terminée');
      return { success: true };
    } catch (error: any) {
      logger.error({ journalId, error }, 'Restauration échouée');
      await db.journalRestauration.update({
        where: { id: restoreRecord.id },
        data: {
          statut: StatutOperation.Echec,
          heureFin: new Date(),
          messageLog: error.message || 'Erreur inconnue',
        },
      });
      return { success: false, error: error.message };
    }
  }

  private detectCompression(filePath: string): CompressionFormat {
    if (filePath.endsWith('.tar.gz')) return 'tar.gz';
    if (filePath.endsWith('.zip')) return 'zip';
    if (filePath.endsWith('.gz')) return 'gzip';
    return 'none';
  }

  private async prepareFileForRestore(filePath: string, compression?: RestoreOptions['compressionFormat']) {
    if (!compression || compression === 'none') {
      return filePath;
    }

    if (compression === 'gzip') {
      return filePath;
    }

    const outputDir = join(appConfig.backupRoot, 'tmp');
    const decompressed = await decompressFile(filePath, outputDir, compression);
    return decompressed;
  }
}

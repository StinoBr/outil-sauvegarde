// backend/server/services/BackupService.ts

import { db } from '../utils/db';
import { executeStreamCommand, type ShellResult } from '../utils/shellExecutor';
import { decrypt } from '../utils/crypto';

import type { PlanSauvegarde, SGBDCible, DestinationStockage } from '@prisma/client';
import { TypeSGBD, StatutOperation } from '@prisma/client';

import path from 'path';
import fsPromises from 'fs/promises';
import * as fs from 'fs';

type PlanAvecRelations = PlanSauvegarde & {
  sgbdCible: SGBDCible;
  destination: DestinationStockage;
};

export class BackupService {

  async executeBackup(planId: number): Promise<ShellResult> {

    const journal = await db.journalSauvegarde.create({
      data: {
        planId,
        statut: StatutOperation.EnCours,
        heureDebut: new Date(),
      },
    });

    try {
      const plan = await db.planSauvegarde.findUnique({
        where: { id: planId },
        include: { sgbdCible: true, destination: true }
      });

      if (!plan) throw new Error(`Plan de sauvegarde ID ${planId} introuvable.`);

      // Détection compression
      const isNativeCompressed = plan.sgbdCible.typeSgbd === TypeSGBD.PostgreSQL;
      const useGzipCompression = plan.compressionActivee && !isNativeCompressed;

      // 🔥 Commande ASYNCHRONE
      const { command, args } = await this._getCommand(plan.sgbdCible);
      const envVars = this._getEnvVariables(plan.sgbdCible);

      const { filePath, fileName } = this._getOutputFilePath(plan, useGzipCompression);

      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });

      const result = await executeStreamCommand(
        command,
        args,
        filePath,
        envVars,
        useGzipCompression
      );

      if (!result.success) {
        throw new Error(result.error || 'Erreur inconnue durant la sauvegarde');
      }

      const stats = await fsPromises.stat(filePath);

      await db.journalSauvegarde.update({
        where: { id: journal.id },
        data: {
          statut: StatutOperation.Succes,
          heureFin: new Date(),
          dureeSecondes: (new Date().getTime() - journal.heureDebut.getTime()) / 1000,
          cheminFichierLocal: filePath,
          tailleFichierOctet: stats.size,
          messageLog: `Sauvegarde ${fileName} terminée avec succès.`,
        }
      });

      return { success: true };

    } catch (error: any) {

      await db.journalSauvegarde.update({
        where: { id: journal.id },
        data: {
          statut: StatutOperation.Echec,
          heureFin: new Date(),
          messageLog: error.message || 'Erreur inconnue',
        }
      });

      return { success: false, error: error.message };
    }
  }

  // --------------------------------------------------------------------------
  // 🔥 _getPgDumpPath ASYNCHRONE
  // --------------------------------------------------------------------------
  private async _getPgDumpPath(): Promise<string> {

    const possiblePaths = [
      'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\12\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\11\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\10\\bin\\pg_dump.exe',
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    throw new Error(
      'pg_dump.exe introuvable (versions 10 → 16). Installez PostgreSQL ou modifiez le chemin.'
    );
  }

  // --------------------------------------------------------------------------
  // 🔥 Commande ASYNCHRONE
  // --------------------------------------------------------------------------
  private async _getCommand(target: SGBDCible): Promise<{ command: string; args: string[] }> {

    const password = decrypt(target.motDePasse);

    switch (target.typeSgbd) {

      case TypeSGBD.PostgreSQL: {
        const connString =
          `postgresql://${target.nomUtilisateur}:${password}` +
          `@${target.adresseIp}:${target.port}/${target.nomBaseDeDonnees}`;

        const pgDumpPath = await this._getPgDumpPath(); // 🔥 await obligatoire

        return {
          command: pgDumpPath,
          args: [
            '-F', 'c',
            '-d', connString
          ]
        };
      }

      case TypeSGBD.MySQL:
        return {
          command: 'mysqldump',
          args: [
            '-h', target.adresseIp,
            '-P', target.port.toString(),
            '-u', target.nomUtilisateur,
            '--single-transaction',
            target.nomBaseDeDonnees
          ]
        };

      default:
        throw new Error(`Type de SGBD non supporté: ${target.typeSgbd}`);
    }
  }

  // --------------------------------------------------------------------------

  private _getEnvVariables(target: SGBDCible): NodeJS.ProcessEnv {
    const password = decrypt(target.motDePasse);

    if (target.typeSgbd === TypeSGBD.PostgreSQL) return { PGPASSWORD: password };
    if (target.typeSgbd === TypeSGBD.MySQL) return { MYSQL_PWD: password };

    return {};
  }

  private _getOutputFilePath(
    plan: PlanAvecRelations,
    useGzip: boolean
  ): { filePath: string; fileName: string } {

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const planName = plan.nomPlan.replace(/\s+/g, '-').toLowerCase();

    let baseExtension = plan.sgbdCible.typeSgbd === TypeSGBD.PostgreSQL ? 'dump' : 'sql';
    const finalExtension = useGzip ? `${baseExtension}.gz` : baseExtension;

    const fileName = `backup-${planName}-${timestamp}.${finalExtension}`;
    const filePath = path.join(plan.destination.cheminLocal, fileName);

    return { filePath, fileName };
  }
}

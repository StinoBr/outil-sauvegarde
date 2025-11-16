// backend/server/services/RestoreService.ts

import { db } from '../utils/db';
import { executeStreamInCommand, type ShellResult } from '../utils/shellExecutor';
import { decrypt } from '../utils/crypto';

import type { SGBDCible } from '@prisma/client';
import { TypeSGBD, StatutOperation } from '@prisma/client';

import * as fs from 'fs';
import fsPromises from 'fs/promises';

export class RestoreService {

  /**
   * Exécute une restauration.
   */
  async executeRestore(journalSauvegardeId: number): Promise<ShellResult> {

    const journalRestore = await db.journalRestauration.create({
      data: {
        sauvegardeId: journalSauvegardeId,
        statut: StatutOperation.EnCours,
        heureDebut: new Date(),
      },
    });

    try {
      // Récupère la sauvegarde + plan + SGBD cible
      const backupToRestore = await db.journalSauvegarde.findUnique({
        where: { id: journalSauvegardeId },
        include: {
          plan: {
            include: { sgbdCible: true }
          }
        }
      });

      if (!backupToRestore) {
        throw new Error(`Journal de sauvegarde ID ${journalSauvegardeId} introuvable.`);
      }
      if (backupToRestore.statut !== StatutOperation.Succes) {
        throw new Error(`La sauvegarde ID ${journalSauvegardeId} n'est pas un succès, impossible de restaurer.`);
      }
      if (!backupToRestore.cheminFichierLocal) {
        throw new Error(`Chemin du fichier introuvable pour la sauvegarde ID ${journalSauvegardeId}.`);
      }

      // Vérifier que le fichier existe
      try {
        await fsPromises.access(backupToRestore.cheminFichierLocal);
      } catch {
        throw new Error(`Fichier de sauvegarde introuvable : ${backupToRestore.cheminFichierLocal}`);
      }

      const target = backupToRestore.plan.sgbdCible;
      const filePath = backupToRestore.cheminFichierLocal;

      // Déterminer si .gz doit être décompressé
      let useDecompression = filePath.endsWith('.gz');
      if (target.typeSgbd === TypeSGBD.PostgreSQL) {
        useDecompression = false; // pg_restore gère tout seul
      }

      // Commande de restauration
      const { command, args } = this._getRestoreCommand(target);
      const envVars = this._getEnvVariables(target);

      // Exécuter !
      const result = await executeStreamInCommand(
        command,
        args,
        filePath,
        envVars,
        useDecompression
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      await db.journalRestauration.update({
        where: { id: journalRestore.id },
        data: {
          statut: StatutOperation.Succes,
          heureFin: new Date(),
          messageLog: 'Restauration terminée avec succès.'
        }
      });

      return { success: true };

    } catch (error: any) {

      await db.journalRestauration.update({
        where: { id: journalRestore.id },
        data: {
          statut: StatutOperation.Echec,
          heureFin: new Date(),
          messageLog: error.message || 'Erreur inconnue'
        }
      });

      return { success: false, error: error.message };
    }
  }

  // ------------------------------------------------------------------------------
  // 🔥 Détection automatique du chemin pg_restore.exe (synchrone, sans require)
  // ------------------------------------------------------------------------------

  private _getPgRestorePath(): string {
    const possiblePaths = [
      'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_restore.exe',
      'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_restore.exe',
      'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_restore.exe',
      'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_restore.exe',
      'C:\\Program Files\\PostgreSQL\\12\\bin\\pg_restore.exe',
      'C:\\Program Files\\PostgreSQL\\11\\bin\\pg_restore.exe',
      'C:\\Program Files\\PostgreSQL\\10\\bin\\pg_restore.exe',
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    throw new Error(
      'pg_restore.exe introuvable (versions 10 → 16). Vérifiez votre installation PostgreSQL.'
    );
  }

  // ------------------------------------------------------------------------------
  // Commandes de restauration
  // ------------------------------------------------------------------------------

  private _getRestoreCommand(target: SGBDCible): { command: string; args: string[] } {

    const password = decrypt(target.motDePasse);

    switch (target.typeSgbd) {
      case TypeSGBD.PostgreSQL: {

        const connString =
          `postgresql://${target.nomUtilisateur}:${password}` +
          `@${target.adresseIp}:${target.port}/${target.nomBaseDeDonnees}`;

        return {
          command: this._getPgRestorePath(), // 🔥 auto-detect
          args: [
            '--clean',
            '--if-exists',
            '-d', connString
          ],
        };
      }

      case TypeSGBD.MySQL:
        return {
          command: 'mysql',
          args: [
            '-h', target.adresseIp,
            '-P', target.port.toString(),
            '-u', target.nomUtilisateur,
            target.nomBaseDeDonnees
          ],
        };

      default:
        throw new Error(`Type de SGBD non supporté pour restauration: ${target.typeSgbd}`);
    }
  }

  // ------------------------------------------------------------------------------
  // Variables d'environnement
  // ------------------------------------------------------------------------------

  private _getEnvVariables(target: SGBDCible): NodeJS.ProcessEnv {
    const password = decrypt(target.motDePasse);

    if (target.typeSgbd === TypeSGBD.PostgreSQL) return { PGPASSWORD: password };
    if (target.typeSgbd === TypeSGBD.MySQL) return { MYSQL_PWD: password };

    return {};
  }
}

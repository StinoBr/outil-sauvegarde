// backend/server/api/plans/[id]/execute.post.ts

import { BackupService } from '~/server/src/services/BackupService';
import type { ShellResult } from '~/server/src/utils/process';

// defineEventHandler est le constructeur d'endpoint de Nitro
export default defineEventHandler(async (event) => {
  
  // 1. Récupérer l'ID de l'URL (ex: /api/plans/5/execute)
  const planId = getRouterParam(event, 'id');
  
  if (!planId) {
    throw createError({ statusCode: 400, statusMessage: 'ID du plan manquant' });
  }

  // 2. Instancier et appeler notre service
  const backupService = new BackupService();
  
  // On n'attend PAS (await) la fin.
  // Une sauvegarde peut prendre 30 minutes. On ne veut pas que le frontend attende.
  // On lance la tâche en arrière-plan et on répond "OK, c'est lancé".
  backupService.executeBackup(Number(planId))
    // 2. TYPER le paramètre 'result'
    .then((result: ShellResult) => {
      // Le travail est fini (peut-être 30 min plus tard)
      // On log le résultat côté serveur
      if (result.success) {
        console.log(`[Sauvegarde] Plan ${planId} terminé avec SUCCÈS.`);
      } else {
        console.error(`[Sauvegarde] Plan ${planId} en ÉCHEC: ${result.error}`);
      }
    });

  // 3. Répondre immédiatement au frontend
  return { 
    success: true, 
    message: `Lancement de la sauvegarde pour le plan ${planId}.` 
  };
});
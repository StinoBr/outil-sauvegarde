// backend/server/api/restore/[id].post.ts

import { RestoreService } from '~/server/src/services/RestoreService';

export default defineEventHandler(async (event) => {
  
  // 1. Récupérer l'ID de la sauvegarde (journal) depuis l'URL
  const journalId = getRouterParam(event, 'id');
  
  if (!journalId) {
    throw createError({ statusCode: 400, statusMessage: 'ID du journal de sauvegarde manquant' });
  }

  // 2. Instancier et appeler notre service
  const restoreService = new RestoreService();
  
  // Comme pour la sauvegarde, on lance en arrière-plan et on répond.
  restoreService.executeRestore(Number(journalId))
    .then(result => {
      if (result.success) {
        console.log(`[Restauration] Journal ${journalId} restauré avec SUCCÈS.`);
      } else {
        console.error(`[Restauration] Journal ${journalId} en ÉCHEC: ${result.error}`);
      }
    });

  // 3. Répondre immédiatement
  return { 
    success: true, 
    message: `Lancement de la restauration pour le journal ${journalId}.` 
  };
});
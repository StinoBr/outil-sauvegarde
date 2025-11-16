// backend/server/api/plans.get.ts

import { db } from '~/server/utils/db';

// Cet endpoint va lister tous les plans de sauvegarde
export default defineEventHandler(async (event) => {
  
  const plans = await db.planSauvegarde.findMany({
    // On inclut les relations pour afficher les noms
    include: {
      sgbdCible: {
        select: { nomConnexion: true } // On ne prend que le nom
      },
      destination: {
        select: { nomDestination: true }
      }
    }
  });
  
  return plans;
});
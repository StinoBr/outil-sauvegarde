// backend/server/api/sgbd-targets.get.ts

import { db } from '~/server/src/utils/db';

// Cet endpoint va lister toutes les cibles SGBD
export default defineEventHandler(async (event) => {
  
  try {
    const targets = await db.sGBDCible.findMany({
      // On trie par nom
      orderBy: {
        nomConnexion: 'asc',
      },
      // On ne sélectionne que ce dont on a besoin
      // On ne renvoie JAMAIS le mot de passe au frontend
      select: {
        id: true,
        nomConnexion: true,
        typeSgbd: true,
        adresseIp: true,
        port: true,
        nomBaseDeDonnees: true,
        nomUtilisateur: true,
        // PAS de motDePasse ici !
      },
    });
    
    return targets;

  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Impossible de récupérer les cibles.",
    });
  }
});
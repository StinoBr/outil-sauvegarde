// backend/server/api/sgbd-targets.post.ts

import { db } from '~/server/src/utils/db';
import { encrypt } from '~/server/src/utils/crypto';
import { TypeSGBD } from '@prisma/client';

// defineEventHandler est le constructeur d'endpoint de Nitro
export default defineEventHandler(async (event) => {
  
  // 1. Lire les données du corps (body) de la requête POST
  const body = await readBody(event);

  // 2. Valider les données (basique)
  if (!body.nomConnexion || !body.typeSgbd || !body.adresseIp || !body.port || !body.nomBaseDeDonnees || !body.nomUtilisateur || !body.motDePasse) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données manquantes. Tous les champs sont requis.',
    });
  }

  // 3. Chiffrer le mot de passe [Règle RG-SEC-01]
  const motDePasseChiffre = encrypt(body.motDePasse);

  try {
    // 4. Créer l'enregistrement dans la base de données
    const newTarget = await db.sGBDCible.create({
      data: {
        nomConnexion: body.nomConnexion,
        typeSgbd: body.typeSgbd as TypeSGBD, // 'as TypeSGBD' indique à TS que c'est bien notre enum
        adresseIp: body.adresseIp,
        port: Number(body.port),
        nomBaseDeDonnees: body.nomBaseDeDonnees,
        nomUtilisateur: body.nomUtilisateur,
        motDePasse: motDePasseChiffre, // On stocke le mot de passe chiffré
      },
    });

    // 5. Renvoyer l'objet créé (sans le mot de passe !)
    return {
      id: newTarget.id,
      nomConnexion: newTarget.nomConnexion,
    };

  } catch (error: any) {
    // Gérer les erreurs (ex: 'nomConnexion' déjà utilisé, car il est @unique)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Impossible de créer la cible SGBD.",
    });
  }
});
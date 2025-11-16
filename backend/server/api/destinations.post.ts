// backend/server/api/destinations.post.ts
import { db } from '~/server/src/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.nomDestination || !body.cheminLocal) {
    throw createError({ statusCode: 400, statusMessage: 'Nom et chemin requis' });
  }

  try {
    const newDestination = await db.destinationStockage.create({
      data: {
        nomDestination: body.nomDestination,
        cheminLocal: body.cheminLocal,
      },
    });
    return newDestination;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
// backend/server/api/plans.post.ts
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Validation
  if (!body.nomPlan || !body.frequenceCron || !body.sgbdCibleId || !body.destinationId) {
    throw createError({ statusCode: 400, statusMessage: 'Champs requis manquants' });
  }

  try {
    const newPlan = await db.planSauvegarde.create({
      data: {
        nomPlan: body.nomPlan,
        frequenceCron: body.frequenceCron,
        typeSauvegarde: body.typeSauvegarde || 'Complet',
        compressionActivee: body.compressionActivee ?? true, // Vrai par défaut
        actif: body.actif ?? true, // Actif par défaut
        sgbdCibleId: Number(body.sgbdCibleId),
        destinationId: Number(body.destinationId),
      },
    });
    return newPlan;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
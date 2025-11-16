import type { H3Event } from 'h3';
import { db } from '../utils/db';
import { SchedulerService } from '../services/SchedulerService';

const scheduler = new SchedulerService();

export async function listPlans() {
  return db.planSauvegarde.findMany({
    include: {
      sgbdCible: { select: { nomConnexion: true, typeSgbd: true } },
      destination: { select: { nomDestination: true, cloudProvider: true } },
    },
  });
}

export async function createPlan(event: H3Event) {
  const body = await readBody(event);
  if (!body.nomPlan || !body.frequenceCron || !body.sgbdCibleId || !body.destinationId) {
    throw createError({ statusCode: 400, statusMessage: 'Champs requis manquants' });
  }

  const plan = await db.planSauvegarde.create({
    data: {
      nomPlan: body.nomPlan,
      frequenceCron: body.frequenceCron,
      typeSauvegarde: body.typeSauvegarde || 'full',
      compressionActivee: body.compressionActivee ?? true,
      actif: body.actif ?? true,
      sgbdCibleId: Number(body.sgbdCibleId),
      destinationId: Number(body.destinationId),
    },
  });

  await scheduler.schedule(plan);
  return plan;
}

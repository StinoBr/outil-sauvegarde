// backend/server/api/plans.post.ts
import { createPlan } from '~/server/src/api/planController';

export default defineEventHandler(async (event) => {
  try {
    return await createPlan(event);
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
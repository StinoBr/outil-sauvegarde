// backend/server/api/plans.get.ts
import { listPlans } from '~/server/src/api/planController';

export default defineEventHandler(async () => {
  return listPlans();
});
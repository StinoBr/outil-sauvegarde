// backend/server/api/destinations.get.ts
import { db } from '~/server/src/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const destinations = await db.destinationStockage.findMany({
      orderBy: { nomDestination: 'asc' },
    });
    return destinations;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
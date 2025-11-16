// backend/server/api/journals.get.ts

import { db } from '~/server/utils/db';

// --- Utilitaire pour convertir BigInt → Number avant JSON ---
function fixBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

// Endpoint pour lister les journaux
export default defineEventHandler(async (event) => {
  
  const journals = await db.journalSauvegarde.findMany({
    orderBy: { heureDebut: 'desc' },
    include: {
      plan: { select: { nomPlan: true } }
    }
  });

  // 🔥 Correction : convertir toutes les valeurs BigInt
  return fixBigInt(journals);
});

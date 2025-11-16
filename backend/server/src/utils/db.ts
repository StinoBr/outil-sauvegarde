// backend/server/utils/db.ts

import Prisma from '@prisma/client';

const { PrismaClient, StatutOperation, TypeSGBD } = Prisma;

// Crée une instance globale du client Prisma
// pour qu'elle soit partagée dans toute notre application backend.
export const db = new PrismaClient();
export { StatutOperation, TypeSGBD };

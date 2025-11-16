// backend/server/utils/db.ts

import { PrismaClient } from '@prisma/client';

// Crée une instance globale du client Prisma
// pour qu'elle soit partagée dans toute notre application backend.
export const db = new PrismaClient();
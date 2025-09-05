/**
 * Prisma Client singleton — avoids multiple connections during dev restarts.
 */


import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();



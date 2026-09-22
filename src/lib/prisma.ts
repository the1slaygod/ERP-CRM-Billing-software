import { PrismaClient } from '@prisma/client';

export const isDatabaseConfigured = Boolean(
  process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

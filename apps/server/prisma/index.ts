import { PrismaClient } from './generated/client';

// Ensure we have the correct database URL format
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Validate that we're using a direct PostgreSQL connection, not Prisma Data Proxy
if (
  databaseUrl.startsWith('prisma://') ||
  databaseUrl.startsWith('prisma+postgres://')
) {
  throw new Error(
    'DATABASE_URL should be a direct PostgreSQL connection string, not a Prisma Data Proxy URL. Use postgresql:// instead.'
  );
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export default prisma;

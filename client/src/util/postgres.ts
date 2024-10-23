"use server"
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL_PG}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
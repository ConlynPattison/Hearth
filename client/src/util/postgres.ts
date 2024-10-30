import { PrismaClient } from '@prisma/client';

// recommended Next.js instantiation singleton approach found on prisma.io/docs/orm/help-and-troubleshooting
const prismaClientSingleton = () => {
	return new PrismaClient();
}

declare const globalThis: {
	prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
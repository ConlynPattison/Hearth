import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const runPrisma = async () => {
    try {
        await prisma.$connect();
        await prisma.$queryRaw `SELECT 1`;
        console.log("Pinged your deployment to Postgres!");
    }
    finally {
        await prisma.$disconnect();
    }
};
export { runPrisma, prisma };

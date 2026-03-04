import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        const stores = await prisma.store.findMany();
        console.log("Stores:", JSON.stringify(stores, null, 2));

        const branches = await prisma.branch.findMany();
        console.log("Branches:", JSON.stringify(branches, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("=== TRANSACTIONS CHECK ===");
        const materialId = "cmmdduttl0006ucqx0jn8kg53";
        const transactions = await prisma.stockTransaction.findMany({
            where: { itemId: materialId },
            orderBy: { timestamp: 'asc' }
        });
        console.log("TRANSACTIONS:", JSON.stringify(transactions, null, 2));

        const allocations = await prisma.materialAllocation.findMany({
            where: { materialId },
            orderBy: { allocatedAt: 'asc' }
        });
        console.log("ALLOCATIONS:", JSON.stringify(allocations, null, 2));

        const consumptions = await prisma.materialConsumption.findMany({
            where: { materialId },
            orderBy: { consumedAt: 'asc' }
        });
        console.log("CONSUMPTIONS:", JSON.stringify(consumptions, null, 2));

        console.log("=== ALL RAW MATERIALS ===");
        const allMaterials = await prisma.rawMaterial.findMany();
        console.log(JSON.stringify(allMaterials, null, 2));

        console.log("=== END ===");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("=== DIAGNOSTICS STARTED ===");

        // 1. Check for Welding Rods
        const materials = await prisma.rawMaterial.findMany({
            where: { name: { contains: 'welding', mode: 'insensitive' } }
        });
        console.log("MATERIALS:", JSON.stringify(materials, null, 2));

        // 2. Check for Plywood Operator
        const user = await prisma.user.findFirst({
            where: { email: 'plywood@test.com' }
        });
        console.log("PLYWOOD_USER_EXISTS:", !!user);
        if (user) {
            console.log("USER_DATA:", JSON.stringify(user, null, 2));
        }

        // 3. Find Material Allocations and Consumptions for welding rods
        if (materials.length > 0) {
            const materialId = materials[0].id;
            const allocations = await prisma.materialAllocation.findMany({
                where: { materialId },
                include: { order: true }
            });
            console.log("ALLOCATIONS:", JSON.stringify(allocations, null, 2));

            const consumptions = await prisma.materialConsumption.findMany({
                where: { materialId },
                include: { order: true }
            });
            console.log("CONSUMPTIONS:", JSON.stringify(consumptions, null, 2));
        }

        console.log("=== DIAGNOSTICS ENDED ===");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

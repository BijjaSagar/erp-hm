import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        const branches = await prisma.branch.findMany();
        console.log("Branches:", JSON.stringify(branches, null, 2));

        const order = await prisma.order.findUnique({
            where: { orderNumber: "ORD26010002" },
            include: { branch: true }
        });
        console.log("Order ORD26010002:", JSON.stringify(order, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

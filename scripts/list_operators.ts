import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'OPERATOR' },
            include: {
                employee: true,
            },
        });
        console.log("OPERATORS_LIST_START");
        console.log(JSON.stringify(users, null, 2));
        console.log("OPERATORS_LIST_END");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

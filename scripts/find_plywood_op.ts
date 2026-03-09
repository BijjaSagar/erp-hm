import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'plywood-fitting@test.com' },
                    { name: { contains: 'Plywood', mode: 'insensitive' } }
                ]
            },
            include: { employee: true }
        });
        if (user) {
            console.log("FOUND_PLYWOOD_OPERATOR");
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log("NOT_FOUND");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

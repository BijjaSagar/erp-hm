import { PrismaClient, ProductionStage } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const employees = await prisma.employee.findMany({
            where: {
                assignedStages: {
                    has: ProductionStage.PLYWOOD_FITTING
                }
            },
            include: { user: true }
        });
        if (employees.length > 0) {
            console.log("EMPLOYEES_FOUND");
            console.log(JSON.stringify(employees, null, 2));
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

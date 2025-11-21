import { PrismaClient, Role, ProductionStage } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = 'password123';
    const hashedPassword = await hash(password, 10);

    // Ensure branch exists
    let branch = await prisma.branch.findFirst();
    if (!branch) {
        branch = await prisma.branch.create({
            data: {
                name: 'Main Branch',
                code: 'MB001',
                address: '123 Test St',
            },
        });
    }

    // Define operators and their assigned stages
    const operators = [
        {
            name: 'Cutting Operator',
            email: 'cutting@test.com',
            stages: [ProductionStage.PENDING, ProductionStage.CUTTING],
        },
        {
            name: 'Shaping Operator',
            email: 'shaping@test.com',
            stages: [ProductionStage.SHAPING],
        },
        {
            name: 'Bending Operator',
            email: 'bending@test.com',
            stages: [ProductionStage.BENDING],
        },
        {
            name: 'Welding Inner Operator',
            email: 'welding_inner@test.com',
            stages: [ProductionStage.WELDING_INNER],
        },
        {
            name: 'Welding Outer Operator',
            email: 'welding_outer@test.com',
            stages: [ProductionStage.WELDING_OUTER],
        },
        {
            name: 'Grinding Operator',
            email: 'grinding@test.com',
            stages: [ProductionStage.GRINDING],
        },
        {
            name: 'Finishing Operator',
            email: 'finishing@test.com',
            stages: [ProductionStage.FINISHING],
        },
        {
            name: 'Painting Operator',
            email: 'painting@test.com',
            stages: [ProductionStage.PAINTING],
        },
    ];

    console.log('Seeding operators...');

    for (const op of operators) {
        // Create Employee
        const employee = await prisma.employee.create({
            data: {
                name: op.name,
                designation: 'Operator',
                branchId: branch.id,
                assignedStages: op.stages,
                department: op.stages[0], // Primary department
            },
        });

        // Create User
        await prisma.user.upsert({
            where: { email: op.email },
            update: {
                employeeId: employee.id,
                role: Role.OPERATOR,
                password: hashedPassword,
            },
            create: {
                email: op.email,
                password: hashedPassword,
                name: op.name,
                role: Role.OPERATOR,
                branchId: branch.id,
                employeeId: employee.id,
            },
        });

        console.log(`Created ${op.name} (${op.email})`);
    }

    // Create a test order in PENDING state
    await prisma.order.create({
        data: {
            orderNumber: 'ORD-FLOW-TEST',
            customerName: 'Flow Test Customer',
            status: 'APPROVED',
            currentStage: 'PENDING',
            branchId: branch.id,
            items: {
                create: {
                    productName: 'Flow Test Product',
                    quantity: 5,
                }
            }
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

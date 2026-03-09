import { PrismaClient, Role, ProductionStage } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating Plywood Fitting Operator...');

    const email = 'plywood@test.com';
    const password = 'password123';
    const hashedPassword = await hash(password, 10);

    // 1. Find or create branch
    let branch = await prisma.branch.findFirst({
        where: { code: 'MAIN' }
    });
    
    if (!branch) {
        branch = await prisma.branch.findFirst();
    }

    if (!branch) {
        branch = await prisma.branch.create({
            data: {
                name: 'Main Factory',
                code: 'MAIN',
                address: 'Factory Address'
            }
        });
    }

    // 2. Create Employee
    const employee = await prisma.employee.upsert({
        where: { id: 'plywood-op-id' }, // Using a fixed ID for predictable seeded data
        update: {
            assignedStages: { set: [ProductionStage.PLYWOOD_FITTING] }
        },
        create: {
            id: 'plywood-op-id',
            name: 'Plywood Fitting Operator',
            designation: 'Operator',
            branchId: branch.id,
            assignedStages: [ProductionStage.PLYWOOD_FITTING]
        }
    });

    // 3. Create User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            employeeId: employee.id,
            role: Role.OPERATOR,
            password: hashedPassword
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Plywood Fitting Operator',
            role: Role.OPERATOR,
            branchId: branch.id,
            employeeId: employee.id
        }
    });

    console.log('✅ Plywood Fitting Operator created successfully!');
    console.log('   Email:', email);
    console.log('   Password:', password);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

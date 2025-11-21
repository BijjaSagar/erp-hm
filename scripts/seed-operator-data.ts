import { PrismaClient, ProductionStage, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding operator data...');

    // 1. Ensure Branch exists
    const branch = await prisma.branch.upsert({
        where: { code: 'BR001' },
        update: {},
        create: {
            name: 'Main Branch',
            code: 'BR001',
            address: '123 Main St',
        }
    });

    // 2. Ensure Employee exists
    const employee = await prisma.employee.create({
        data: {
            name: 'Test Operator',
            designation: 'Operator',
            branchId: branch.id,
        }
    });

    // 3. Update Operator User to link to Employee
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'operator@test.com' },
        update: {
            employeeId: employee.id,
            branchId: branch.id,
        },
        create: {
            email: 'operator@test.com',
            password: hashedPassword,
            name: 'Test Operator',
            role: 'OPERATOR',
            branchId: branch.id,
            employeeId: employee.id,
        }
    });

    // 4. Create a Test Order
    const order = await prisma.order.create({
        data: {
            orderNumber: `ORD-${Date.now()}`,
            customerName: 'Test Customer',
            status: OrderStatus.APPROVED,
            currentStage: ProductionStage.PENDING,
            branchId: branch.id,
            items: {
                create: [
                    { productName: 'Test Product', quantity: 5 }
                ]
            }
        }
    });

    console.log('Operator data seeded successfully.');
    console.log('User:', user.email);
    console.log('Employee ID:', employee.id);
    console.log('Order:', order.orderNumber);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

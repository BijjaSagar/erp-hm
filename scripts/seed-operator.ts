import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'operator@test.com';
    const password = 'password123';
    const hashedPassword = await hash(password, 10);

    // Create a branch if not exists
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

    // Create an employee
    const employee = await prisma.employee.create({
        data: {
            name: 'Test Operator',
            designation: 'Operator',
            branchId: branch.id,
        },
    });

    // Create a user linked to the employee
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            employeeId: employee.id,
            role: Role.OPERATOR,
        },
        create: {
            email,
            password: hashedPassword, // Note: The auth.ts currently uses plain text comparison for simplicity as per previous code, but good to hash. Wait, the auth.ts said "Simple password check for now (TODO: Use bcrypt)". Let's check auth.ts again.
            name: 'Test Operator',
            role: Role.OPERATOR,
            branchId: branch.id,
            employeeId: employee.id,
        },
    });

    // Create an admin user
    const adminEmail = 'admin@test.com';
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: Role.ADMIN,
            password: hashedPassword,
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Test Admin',
            role: Role.ADMIN,
            branchId: branch.id,
        },
    });

    // Create a test order
    const order = await prisma.order.create({
        data: {
            orderNumber: 'ORD-TEST-001',
            customerName: 'Test Customer',
            status: 'APPROVED',
            currentStage: 'PENDING',
            branchId: branch.id,
            items: {
                create: {
                    productName: 'Test Product',
                    quantity: 10,
                }
            }
        }
    });

    console.log({ user, employee, order });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

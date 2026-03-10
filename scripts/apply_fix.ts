import { PrismaClient, Role, ProductionStage, StockTxType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("=== FIX SCRIPT STARTED ===");

    // 1. Get a valid user
    const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    const userId = adminUser?.id || 'clsq1z2o4000008jp1ehuht8y'; // Fallback

    // 2. Create Plywood Operator
    const email = 'plywood@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let branch = await prisma.branch.findFirst();
    if (!branch) {
        branch = await prisma.branch.create({
            data: { name: 'Main Branch', code: 'MAIN', address: 'Factory' }
        });
    }

    const employee = await prisma.employee.upsert({
        where: { id: 'plywood-op-fix' },
        update: { assignedStages: [ProductionStage.PLYWOOD_FITTING] },
        create: {
            id: 'plywood-op-fix',
            name: 'Plywood Fitting Operator',
            designation: 'Operator',
            branchId: branch.id,
            assignedStages: [ProductionStage.PLYWOOD_FITTING]
        }
    });

    await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword, employeeId: employee.id, role: Role.OPERATOR },
        create: {
            email,
            password: hashedPassword,
            name: 'Plywood Fitting Operator',
            role: Role.OPERATOR,
            branchId: branch.id,
            employeeId: employee.id
        }
    });
    console.log("✅ Plywood User Created/Updated.");

    // 3. Fix Welding Rod Stock
    const material = await prisma.rawMaterial.findFirst({
        where: { name: { contains: 'welding', mode: 'insensitive' } }
    });

    if (material) {
        console.log(`Current Quantity in DB: ${material.quantity}`);
        // If they see 250 in ERP, and they want 260. We add 10 to whatever is there.
        await prisma.rawMaterial.update({
            where: { id: material.id },
            data: { quantity: { increment: 10 } }
        });

        await prisma.stockTransaction.create({
            data: {
                itemId: material.id,
                quantity: 10,
                type: 'ADJUSTMENT',
                userId: userId,
            }
        });
        console.log("✅ Stock Adjusted (+10 pieces).");
    }

    console.log("=== FIX SCRIPT COMPLETED ===");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

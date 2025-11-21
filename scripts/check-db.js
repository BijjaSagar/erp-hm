const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for existing users...');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in database`);

    if (users.length > 0) {
        console.log('\nExisting users:');
        users.forEach(user => {
            console.log(`- ${user.email} (${user.role})`);
        });
    } else {
        console.log('\nNo users found. Creating admin user...');

        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@hm-erp.com',
                password: 'admin123', // Note: In production, this should be hashed
                name: 'Admin User',
                role: 'ADMIN',
            },
        });

        console.log(`✓ Created admin user: ${adminUser.email}`);
        console.log('  Email: admin@hm-erp.com');
        console.log('  Password: admin123');
    }

    console.log('\nChecking branches...');
    const branches = await prisma.branch.findMany();
    console.log(`Found ${branches.length} branches in database`);

    if (branches.length > 0) {
        console.log('\nExisting branches:');
        branches.forEach(branch => {
            console.log(`- ${branch.name} (${branch.code})`);
        });
    }
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
    console.log('🔍 Testing login credentials...\n');

    // Test credentials
    const email = 'admin@hm-erp.com';
    const password = 'admin123';

    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log('✅ User found:');
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        console.log('   Branch ID:', user.branchId);
        console.log('   Password Hash:', user.password.substring(0, 20) + '...');

        // Test password
        const isValid = await compare(password, user.password);

        if (isValid) {
            console.log('\n✅ Password is CORRECT!');
            console.log('   Login should work with: admin@hm-erp.com / admin123');
        } else {
            console.log('\n❌ Password is INCORRECT!');
            console.log('   The stored hash does not match "admin123"');

            // Create new hash
            console.log('\n🔧 Creating new password hash...');
            const newHash = await hash('admin123', 10);

            await prisma.user.update({
                where: { email },
                data: { password: newHash },
            });

            console.log('✅ Password updated! Try logging in again.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();

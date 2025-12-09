import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBranchNames() {
    console.log('🔄 Updating branch names...');

    try {
        // Get all existing branches
        const branches = await prisma.branch.findMany({
            orderBy: { createdAt: 'asc' }
        });

        console.log(`Found ${branches.length} branches`);

        // Update branch names to HM1, HM2, HP1, HP2
        const newBranchData = [
            { code: 'HM1', name: 'HM1' },
            { code: 'HM2', name: 'HM2' },
            { code: 'HP1', name: 'HP1' },
            { code: 'HP2', name: 'HP2' },
        ];

        for (let i = 0; i < Math.min(branches.length, newBranchData.length); i++) {
            const branch = branches[i];
            const newData = newBranchData[i];

            await prisma.branch.update({
                where: { id: branch.id },
                data: {
                    name: newData.name,
                    code: newData.code,
                },
            });

            console.log(`✅ Updated branch: ${branch.name} (${branch.code}) → ${newData.name} (${newData.code})`);
        }

        // If there are fewer than 4 branches, create the missing ones
        if (branches.length < 4) {
            for (let i = branches.length; i < 4; i++) {
                const newData = newBranchData[i];
                const newBranch = await prisma.branch.create({
                    data: {
                        name: newData.name,
                        code: newData.code,
                        address: `${newData.name} Branch Address`,
                    },
                });
                console.log(`✅ Created new branch: ${newBranch.name} (${newBranch.code})`);
            }
        }

        console.log('🎉 Branch names updated successfully!');
    } catch (error) {
        console.error('❌ Error updating branch names:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateBranchNames();

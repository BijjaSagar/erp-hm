import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialItems = [
    { name: 'M.S Sheet', sku: 'MS-SHEET', category: 'Raw Material', unit: 'sheets', reorderLevel: 50 },
    { name: 'Handle', sku: 'HANDLE', category: 'Hardware', unit: 'pcs', reorderLevel: 100 },
    { name: 'Hinges', sku: 'HINGES', category: 'Hardware', unit: 'pcs', reorderLevel: 200 },
    { name: 'Flap Disc', sku: 'FLAP-DISC', category: 'Consumable', unit: 'pcs', reorderLevel: 20 },
    { name: 'CO2 Gas Cylinder', sku: 'CO2-GAS', category: 'Consumable', unit: 'cylinders', reorderLevel: 2 },
    { name: 'Welding Wire (Taar)', sku: 'WELD-WIRE', category: 'Consumable', unit: 'rolls', reorderLevel: 5 },
    { name: 'Back Patti', sku: 'BACK-PATTI', category: 'Raw Material', unit: 'pcs', reorderLevel: 100 },
];

async function main() {
    console.log('Seeding inventory...');

    for (const item of initialItems) {
        await prisma.inventoryItem.upsert({
            where: { sku: item.sku },
            update: {},
            create: {
                name: item.name,
                sku: item.sku,
                category: item.category,
                unit: item.unit,
                reorderLevel: item.reorderLevel,
                quantity: 100, // Initial stock
            }
        });
    }

    console.log('Inventory seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

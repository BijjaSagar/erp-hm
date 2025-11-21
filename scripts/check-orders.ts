import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        include: {
            items: true,
            productionLogs: {
                orderBy: {
                    timestamp: 'desc'
                },
                take: 5
            }
        }
    });

    console.log('\n=== ORDERS ===\n');
    orders.forEach(order => {
        console.log(`Order: ${order.orderNumber}`);
        console.log(`Customer: ${order.customerName}`);
        console.log(`Status: ${order.status}`);
        console.log(`Current Stage: ${order.currentStage}`);
        console.log(`Items: ${order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}`);
        console.log(`Production Logs (${order.productionLogs.length}):`);
        order.productionLogs.forEach(log => {
            console.log(`  - ${log.stage} (${log.status}) at ${log.timestamp.toISOString()}`);
        });
        console.log('---\n');
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

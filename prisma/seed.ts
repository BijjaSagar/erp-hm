import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create branches
    const headOffice = await prisma.branch.upsert({
        where: { code: 'HO' },
        update: {},
        create: {
            name: 'Head Office',
            code: 'HO',
            address: '123 Main Street, Mumbai, Maharashtra 400001',
        },
    });

    const branch1 = await prisma.branch.upsert({
        where: { code: 'BR1' },
        update: {},
        create: {
            name: 'Branch 1 - Pune',
            code: 'BR1',
            address: '456 MG Road, Pune, Maharashtra 411001',
        },
    });

    const branch2 = await prisma.branch.upsert({
        where: { code: 'BR2' },
        update: {},
        create: {
            name: 'Branch 2 - Delhi',
            code: 'BR2',
            address: '789 Connaught Place, New Delhi 110001',
        },
    });

    console.log('✅ Created branches:', { headOffice, branch1, branch2 });

    // Create users
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@hm-erp.com' },
        update: {},
        create: {
            email: 'admin@hm-erp.com',
            password: 'admin123', // TODO: Hash this in production
            name: 'Admin User',
            role: Role.ADMIN,
            branchId: headOffice.id,
        },
    });

    const managerUser = await prisma.user.upsert({
        where: { email: 'manager@hm-erp.com' },
        update: {},
        create: {
            email: 'manager@hm-erp.com',
            password: 'manager123',
            name: 'Branch Manager',
            role: Role.BRANCH_MANAGER,
            branchId: branch1.id,
        },
    });

    const operatorUser = await prisma.user.upsert({
        where: { email: 'operator@hm-erp.com' },
        update: {},
        create: {
            email: 'operator@hm-erp.com',
            password: 'operator123',
            name: 'Operator User',
            role: Role.OPERATOR,
            branchId: branch1.id,
        },
    });

    console.log('✅ Created users:', { adminUser, managerUser, operatorUser });

    // Create employees
    const employee1 = await prisma.employee.upsert({
        where: { id: 'emp1' },
        update: {},
        create: {
            id: 'emp1',
            name: 'Rajesh Kumar',
            designation: 'Production Supervisor',
            phone: '+91-9876543210',
            gpsCoordinates: '19.0760,72.8777', // Mumbai coordinates
            branchId: headOffice.id,
        },
    });

    const employee2 = await prisma.employee.upsert({
        where: { id: 'emp2' },
        update: {},
        create: {
            id: 'emp2',
            name: 'Priya Sharma',
            designation: 'Operator',
            phone: '+91-9876543211',
            gpsCoordinates: '18.5204,73.8567', // Pune coordinates
            branchId: branch1.id,
        },
    });

    const employee3 = await prisma.employee.upsert({
        where: { id: 'emp3' },
        update: {},
        create: {
            id: 'emp3',
            name: 'Amit Patel',
            designation: 'Welder',
            phone: '+91-9876543212',
            gpsCoordinates: '18.5204,73.8567', // Pune coordinates
            branchId: branch1.id,
        },
    });

    const employee4 = await prisma.employee.upsert({
        where: { id: 'emp4' },
        update: {},
        create: {
            id: 'emp4',
            name: 'Sunita Verma',
            designation: 'Quality Inspector',
            phone: '+91-9876543213',
            gpsCoordinates: '28.6139,77.2090', // Delhi coordinates
            branchId: branch2.id,
        },
    });

    console.log('✅ Created employees:', { employee1, employee2, employee3, employee4 });

    // Create sample attendance records
    const today = new Date();
    today.setHours(9, 0, 0, 0);

    const attendance1 = await prisma.attendance.create({
        data: {
            employeeId: employee1.id,
            checkIn: today,
            location: '19.0760,72.8777',
            status: 'PRESENT',
        },
    });

    const attendance2 = await prisma.attendance.create({
        data: {
            employeeId: employee2.id,
            checkIn: new Date(today.getTime() + 30 * 60000), // 30 minutes late
            location: '18.5204,73.8567',
            status: 'LATE',
        },
    });

    console.log('✅ Created attendance records:', { attendance1, attendance2 });

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@hm-erp.com / admin123');
    console.log('Manager: manager@hm-erp.com / manager123');
    console.log('Operator: operator@hm-erp.com / operator123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

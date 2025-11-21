import { PrismaClient, ProductionStage, Role, LeaveType, LeaveStatus, Priority, MachineState } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive test data seeding...');

    // 1. Create Branch
    console.log('📍 Creating branch...');
    const branch = await prisma.branch.upsert({
        where: { code: 'MAIN' },
        update: {},
        create: {
            code: 'MAIN',
            name: 'Main Factory',
            address: '123 Industrial Area, Mumbai'
        }
    });
    console.log('✅ Branch created:', branch.name);

    // 2. Create Operators for all stages
    console.log('👥 Creating operators...');
    const stages: ProductionStage[] = [
        'CUTTING', 'SHAPING', 'BENDING', 'WELDING_INNER',
        'WELDING_OUTER', 'GRINDING', 'FINISHING', 'PAINTING'
    ];

    const operators = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const stage of stages) {
        const stageName = stage.toLowerCase().replace('_', '-');
        const operatorName = `${stage.charAt(0)}${stage.slice(1).toLowerCase().replace('_', ' ')} Operator`;

        const user = await prisma.user.upsert({
            where: { email: `${stageName}@test.com` },
            update: {},
            create: {
                name: operatorName,
                email: `${stageName}@test.com`,
                password: hashedPassword,
                role: Role.OPERATOR,
                branchId: branch.id
            }
        });

        const employee = await prisma.employee.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                name: operatorName,
                phone: `+91-98765${String(stages.indexOf(stage)).padStart(5, '0')}`,
                designation: 'Operator',
                branchId: branch.id,
                assignedStages: [stage]
            }
        });

        // Link the user to the employee
        await prisma.user.update({
            where: { id: user.id },
            data: { employeeId: employee.id }
        });

        operators.push({ user, employee, stage });
        console.log(`✅ Created operator: ${employee.name} (${user.email})`);
    }

    // 3. Create Machines for all stages
    console.log('🔧 Creating machines...');
    const machines = [];
    const stageCodes: Record<string, string> = {
        'CUTTING': 'CUT',
        'SHAPING': 'SHP',
        'BENDING': 'BND',
        'WELDING_INNER': 'WI',
        'WELDING_OUTER': 'WO',
        'GRINDING': 'GRD',
        'FINISHING': 'FIN',
        'PAINTING': 'PNT'
    };

    for (const stage of stages) {
        const machineCount = stage.includes('WELDING') ? 3 : 2;
        for (let i = 1; i <= machineCount; i++) {
            const stageCode = stageCodes[stage];
            const machine = await prisma.machine.create({
                data: {
                    name: `${stage.replace('_', ' ')} Machine ${String(i).padStart(2, '0')}`,
                    code: `${stageCode}-${String(i).padStart(2, '0')}`,
                    stage: stage,
                    branchId: branch.id
                }
            });
            machines.push(machine);
            console.log(`✅ Created machine: ${machine.name}`);
        }
    }

    // 4. Create Test Orders
    console.log('📋 Creating test orders...');
    const orders = [];
    const orderStatuses: ProductionStage[] = [
        'PENDING', 'CUTTING', 'SHAPING', 'BENDING',
        'WELDING_INNER', 'GRINDING', 'FINISHING'
    ];

    for (let i = 1; i <= 7; i++) {
        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${String(i).padStart(4, '0')}`,
                customerName: `Customer ${i}`,
                customerPhone: `+91-9876${String(i).padStart(6, '0')}`,
                currentStage: orderStatuses[i - 1],
                branchId: branch.id
            }
        });
        orders.push(order);
        console.log(`✅ Created order: ${order.orderNumber} - ${order.currentStage}`);
    }

    // 5. Create Attendance Records (last 30 days)
    console.log('📅 Creating attendance records...');
    const today = new Date();
    for (const op of operators) {
        for (let day = 0; day < 30; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() - day);
            date.setHours(0, 0, 0, 0);

            // Skip some days randomly
            if (Math.random() > 0.85) continue;

            const checkInTime = new Date(date);
            checkInTime.setHours(9, Math.floor(Math.random() * 30), 0);

            const checkOutTime = new Date(date);
            checkOutTime.setHours(18, Math.floor(Math.random() * 30), 0);

            await prisma.attendance.create({
                data: {
                    employeeId: op.employee.id,
                    date: date,
                    checkIn: checkInTime,
                    checkOut: Math.random() > 0.1 ? checkOutTime : null,
                    status: checkInTime.getHours() > 9 ? 'LATE' : 'PRESENT'
                }
            });
        }
        console.log(`✅ Created attendance for: ${op.employee.name}`);
    }

    // 6. Create Break Records
    console.log('☕ Creating break records...');
    for (const op of operators) {
        for (let i = 0; i < 10; i++) {
            const breakStart = new Date(today);
            breakStart.setDate(breakStart.getDate() - i);
            breakStart.setHours(12, Math.floor(Math.random() * 60), 0);

            const breakEnd = new Date(breakStart);
            breakEnd.setMinutes(breakEnd.getMinutes() + 15 + Math.floor(Math.random() * 30));

            await prisma.break.create({
                data: {
                    employeeId: op.employee.id,
                    startTime: breakStart,
                    endTime: Math.random() > 0.2 ? breakEnd : null,
                    reason: ['Lunch', 'Tea Break', 'Rest', 'Personal'][Math.floor(Math.random() * 4)]
                }
            });
        }
        console.log(`✅ Created breaks for: ${op.employee.name}`);
    }

    // 7. Create Leave Requests
    console.log('🏖️ Creating leave requests...');
    const leaveTypes: LeaveType[] = ['CASUAL', 'SICK', 'EARNED', 'UNPAID'];
    const leaveStatuses: LeaveStatus[] = ['APPROVED', 'PENDING', 'REJECTED'];

    for (const op of operators) {
        for (let i = 0; i < 3; i++) {
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() + (i * 10) - 15);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1);

            await prisma.leaveRequest.create({
                data: {
                    employeeId: op.employee.id,
                    leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
                    startDate: startDate,
                    endDate: endDate,
                    reason: `Leave reason ${i + 1}`,
                    status: leaveStatuses[Math.floor(Math.random() * leaveStatuses.length)]
                }
            });
        }
        console.log(`✅ Created leave requests for: ${op.employee.name}`);
    }

    // 8. Create Wastage Logs
    console.log('⚠️ Creating wastage logs...');
    for (const op of operators) {
        for (let i = 0; i < 5; i++) {
            const timestamp = new Date(today);
            timestamp.setDate(timestamp.getDate() - (i * 3));

            await prisma.wastageLog.create({
                data: {
                    employeeId: op.employee.id,
                    orderId: orders[Math.floor(Math.random() * orders.length)].id,
                    materialName: ['MS Sheet', 'Welding Wire', 'Paint', 'Grinding Disc'][Math.floor(Math.random() * 4)],
                    quantity: Math.random() * 10 + 1,
                    unit: 'kg',
                    reason: ['Material defect', 'Cutting error', 'Measurement mistake', 'Tool malfunction'][Math.floor(Math.random() * 4)],
                    stage: op.stage,
                    timestamp: timestamp
                }
            });
        }
        console.log(`✅ Created wastage logs for: ${op.employee.name}`);
    }

    // 9. Create Machine Status Reports
    console.log('🔧 Creating machine status reports...');
    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const machineStates: MachineState[] = ['OPERATIONAL', 'STUCK', 'MAINTENANCE', 'BREAKDOWN'];

    for (const op of operators) {
        for (let i = 0; i < 3; i++) {
            const reportedAt = new Date(today);
            reportedAt.setDate(reportedAt.getDate() - (i * 5));

            const resolved = Math.random() > 0.3;
            const resolvedAt = resolved ? new Date(reportedAt.getTime() + (Math.random() * 24 * 60 * 60 * 1000)) : null;

            await prisma.machineStatus.create({
                data: {
                    machineName: machines[Math.floor(Math.random() * machines.length)].name,
                    status: machineStates[Math.floor(Math.random() * machineStates.length)],
                    issue: `Machine issue description ${i + 1}`,
                    priority: priorities[Math.floor(Math.random() * priorities.length)],
                    stage: op.stage,
                    reportedBy: op.employee.id,
                    reportedAt: reportedAt,
                    resolvedAt: resolvedAt,
                    resolvedBy: resolved ? operators[Math.floor(Math.random() * operators.length)].employee.id : null
                }
            });
        }
        console.log(`✅ Created machine status reports for: ${op.employee.name}`);
    }

    // 10. Create Production Entries
    console.log('🏭 Creating production entries...');
    for (let i = 0; i < orders.length - 1; i++) {
        const order = orders[i];
        const stageIndex = stages.indexOf(order.currentStage as ProductionStage);

        // Create entries for completed stages
        for (let j = 0; j <= stageIndex && j < stages.length; j++) {
            const stage = stages[j];
            const operator = operators.find(op => op.stage === stage);
            const machine = machines.find(m => m.stage === stage);

            if (!operator || !machine) continue;

            const startTime = new Date(today);
            startTime.setDate(startTime.getDate() - (stageIndex - j) * 2);
            startTime.setHours(10, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + 4 + Math.floor(Math.random() * 3));

            const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

            const inputQty = 100;
            const outputQty = Math.floor(inputQty * (0.95 + Math.random() * 0.05));
            const wastageQty = Math.floor(inputQty * (Math.random() * 0.03));
            const rejectedQty = inputQty - outputQty - wastageQty;

            await prisma.productionEntry.create({
                data: {
                    orderId: order.id,
                    machineId: machine.id,
                    operatorId: operator.employee.id,
                    stage: stage,
                    inputQuantity: inputQty,
                    outputQuantity: outputQty,
                    rejectedQuantity: rejectedQty,
                    wastageQuantity: wastageQty,
                    wastagePercentage: (wastageQty / inputQty) * 100,
                    startTime: startTime,
                    endTime: endTime,
                    duration: duration,
                    qualityApproved: Math.random() > 0.2
                }
            });
        }
        console.log(`✅ Created production entries for order: ${order.orderNumber}`);
    }

    console.log('\n✨ Comprehensive test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Branch: 1`);
    console.log(`   - Operators: ${operators.length}`);
    console.log(`   - Machines: ${machines.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Attendance records: ~${operators.length * 25}`);
    console.log(`   - Break records: ${operators.length * 10}`);
    console.log(`   - Leave requests: ${operators.length * 3}`);
    console.log(`   - Wastage logs: ${operators.length * 5}`);
    console.log(`   - Machine reports: ${operators.length * 3}`);
    console.log(`   - Production entries: Multiple per order`);
    console.log('\n🔑 Test Credentials:');
    console.log('   All operators: password123');
    stages.forEach(stage => {
        const stageName = stage.toLowerCase().replace('_', '-');
        console.log(`   ${stage}: ${stageName}@test.com`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

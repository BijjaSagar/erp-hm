'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getProductionReports(days: number = 30) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get production entries
        const productionEntries = await prisma.productionEntry.findMany({
            where: {
                operatorId: session.user.employeeId,
                startTime: {
                    gte: startDate
                }
            },
            include: {
                machine: true,
                order: {
                    select: {
                        orderNumber: true,
                        customerName: true
                    }
                }
            },
            orderBy: {
                startTime: 'desc'
            }
        });

        // Calculate statistics
        const totalSessions = productionEntries.length;
        const completedSessions = productionEntries.filter(e => e.endTime).length;
        const totalOutput = productionEntries.reduce((sum, e) => sum + e.outputQuantity, 0);
        const totalWastage = productionEntries.reduce((sum, e) => sum + e.wastageQuantity, 0);
        const totalRejected = productionEntries.reduce((sum, e) => sum + e.rejectedQuantity, 0);

        // Calculate total working hours
        const totalMinutes = productionEntries
            .filter(e => e.duration)
            .reduce((sum, e) => sum + (e.duration || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        // Calculate average efficiency
        const avgEfficiency = totalSessions > 0
            ? ((totalOutput / (totalOutput + totalWastage + totalRejected)) * 100).toFixed(1)
            : '0';

        // Group by stage
        const byStage = productionEntries.reduce((acc, entry) => {
            const stage = entry.stage;
            if (!acc[stage]) {
                acc[stage] = {
                    count: 0,
                    output: 0,
                    wastage: 0,
                    rejected: 0
                };
            }
            acc[stage].count++;
            acc[stage].output += entry.outputQuantity;
            acc[stage].wastage += entry.wastageQuantity;
            acc[stage].rejected += entry.rejectedQuantity;
            return acc;
        }, {} as Record<string, any>);

        // Material consumption
        const materialConsumption = await prisma.materialConsumption.findMany({
            where: {
                consumedBy: session.user.employeeId,
                consumedAt: {
                    gte: startDate
                }
            },
            include: {
                material: {
                    select: {
                        name: true,
                        unit: true
                    }
                }
            }
        });

        // Group materials
        const materialsByType = materialConsumption.reduce((acc, m) => {
            const key = m.material.name;
            if (!acc[key]) {
                acc[key] = {
                    quantity: 0,
                    unit: m.material.unit
                };
            }
            acc[key].quantity += m.quantity;
            return acc;
        }, {} as Record<string, any>);

        return {
            stats: {
                totalSessions,
                completedSessions,
                totalOutput,
                totalWastage,
                totalRejected,
                totalHours,
                avgEfficiency
            },
            productionEntries,
            byStage,
            materialsByType
        };
    } catch (error) {
        console.error("Failed to fetch production reports:", error);
        return { error: "Failed to fetch production reports" };
    }
}

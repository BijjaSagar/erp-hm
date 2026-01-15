"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ProductionStage } from "@prisma/client";

/**
 * Get all machines
 */
export async function getMachines(stage?: ProductionStage) {
    try {
        const where: any = {
            isActive: true,
        };

        if (stage) {
            where.stage = stage;
        }

        const machines = await prisma.machine.findMany({
            where,
            include: {
                branch: true,
                _count: {
                    select: {
                        productionEntries: true,
                        machineStatuses: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return machines;
    } catch (error) {
        console.error("Error fetching machines:", error);
        return [];
    }
}

/**
 * Get machines by stage
 */
export async function getMachinesByStage(stage: ProductionStage) {
    try {
        const machines = await prisma.machine.findMany({
            where: {
                stage,
                isActive: true,
            },
            include: {
                branch: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return machines;
    } catch (error) {
        console.error("Error fetching machines by stage:", error);
        return [];
    }
}

/**
 * Get machine by ID
 */
export async function getMachineById(id: string) {
    try {
        const machine = await prisma.machine.findUnique({
            where: { id },
            include: {
                branch: true,
                productionEntries: {
                    include: {
                        operator: true,
                        order: true,
                    },
                    orderBy: {
                        startTime: "desc",
                    },
                    take: 10,
                },
                machineStatuses: {
                    orderBy: {
                        reportedAt: "desc",
                    },
                    take: 5,
                },
            },
        });

        return machine;
    } catch (error) {
        console.error("Error fetching machine:", error);
        return null;
    }
}

/**
 * Get available machines for a stage
 * (machines that are not currently in use or have issues)
 */
export async function getAvailableMachines(stage: ProductionStage) {
    try {
        // Get all machines for this stage
        const machines = await prisma.machine.findMany({
            where: {
                stage,
                isActive: true,
            },
            include: {
                productionEntries: {
                    where: {
                        endTime: null, // Currently in use
                    },
                },
                machineStatuses: {
                    where: {
                        status: {
                            in: ["STUCK", "BREAKDOWN", "MAINTENANCE"],
                        },
                        resolvedAt: null, // Not resolved
                    },
                },
            },
        });

        // Filter to only available machines
        const availableMachines = machines.filter(machine => {
            const hasActiveEntry = machine.productionEntries.length > 0;
            const hasIssues = machine.machineStatuses.length > 0;
            return !hasActiveEntry && !hasIssues;
        });

        return availableMachines;
    } catch (error) {
        console.error("Error fetching available machines:", error);
        return [];
    }
}

/**
 * Get machine utilization stats
 */
export async function getMachineUtilization(machineId: string, days: number = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const entries = await prisma.productionEntry.findMany({
            where: {
                machineId,
                startTime: {
                    gte: startDate,
                },
            },
            select: {
                startTime: true,
                endTime: true,
                duration: true,
            },
        });

        const totalMinutes = entries.reduce((sum, entry) => {
            return sum + (entry.duration || 0);
        }, 0);

        const totalHours = totalMinutes / 60;
        const availableHours = days * 24;
        const utilizationPercentage = (totalHours / availableHours) * 100;

        return {
            totalEntries: entries.length,
            totalHours: Math.round(totalHours * 10) / 10,
            utilizationPercentage: Math.round(utilizationPercentage * 10) / 10,
            days,
        };
    } catch (error) {
        console.error("Error calculating machine utilization:", error);
        return {
            totalEntries: 0,
            totalHours: 0,
            utilizationPercentage: 0,
            days,
        };
    }
}

/**
 * Create a new machine
 */
export async function createMachine(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const name = formData.get("name") as string;
        const code = formData.get("code") as string;
        const stage = formData.get("stage") as ProductionStage;
        const capacity = formData.get("capacity") as string;
        const branchId = formData.get("branchId") as string;

        if (!name || !code || !stage || !branchId) {
            return { message: "Name, code, stage, and branch are required" };
        }

        // Check if code already exists
        const existing = await prisma.machine.findUnique({
            where: { code },
        });

        if (existing) {
            return { message: "Machine code already exists" };
        }

        const machine = await prisma.machine.create({
            data: {
                name,
                code,
                stage,
                capacity: capacity ? parseInt(capacity) : undefined,
                branchId,
            },
        });

        revalidatePath("/dashboard/machines");
        revalidatePath("/dashboard/production");

        return {
            message: "Machine created successfully",
            machineId: machine.id,
        };
    } catch (error) {
        console.error("Error creating machine:", error);
        return { message: "Failed to create machine" };
    }
}

/**
 * Update machine
 */
export async function updateMachine(
    id: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const name = formData.get("name") as string;
        const capacity = formData.get("capacity") as string;
        const isActive = formData.get("isActive") === "true";

        await prisma.machine.update({
            where: { id },
            data: {
                name,
                capacity: capacity ? parseInt(capacity) : undefined,
                isActive,
            },
        });

        revalidatePath("/dashboard/machines");
        revalidatePath("/dashboard/production");

        return { message: "Machine updated successfully" };
    } catch (error) {
        console.error("Error updating machine:", error);
        return { message: "Failed to update machine" };
    }
}

/**
 * Get machine performance metrics
 */
export async function getMachinePerformance(machineId: string, days: number = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const entries = await prisma.productionEntry.findMany({
            where: {
                machineId,
                startTime: {
                    gte: startDate,
                },
                endTime: { not: null },
            },
            select: {
                inputQuantity: true,
                outputQuantity: true,
                rejectedQuantity: true,
                wastageQuantity: true,
                duration: true,
            },
        });

        const totalInput = entries.reduce((sum, e) => sum + e.inputQuantity, 0);
        const totalOutput = entries.reduce((sum, e) => sum + e.outputQuantity, 0);
        const totalRejected = entries.reduce((sum, e) => sum + e.rejectedQuantity, 0);
        const totalWastage = entries.reduce((sum, e) => sum + e.wastageQuantity, 0);
        const totalDuration = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

        const efficiency = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;
        const rejectionRate = totalInput > 0 ? (totalRejected / totalInput) * 100 : 0;
        const avgOutputPerHour = totalDuration > 0 ? (totalOutput / (totalDuration / 60)) : 0;

        return {
            totalJobs: entries.length,
            totalInput,
            totalOutput,
            totalRejected,
            totalWastage,
            totalHours: Math.round((totalDuration / 60) * 10) / 10,
            efficiency: Math.round(efficiency * 10) / 10,
            rejectionRate: Math.round(rejectionRate * 10) / 10,
            avgOutputPerHour: Math.round(avgOutputPerHour * 10) / 10,
        };
    } catch (error) {
        console.error("Error calculating machine performance:", error);
        return {
            totalJobs: 0,
            totalInput: 0,
            totalOutput: 0,
            totalRejected: 0,
            totalWastage: 0,
            totalHours: 0,
            efficiency: 0,
            rejectionRate: 0,
            avgOutputPerHour: 0,
        };
    }
}

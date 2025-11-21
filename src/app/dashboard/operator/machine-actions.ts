'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { MachineState, Priority, ProductionStage } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface MachineIssueData {
    machineName: string;
    status: MachineState;
    issue: string;
    priority: Priority;
    stage: ProductionStage;
}

export async function reportMachineIssue(data: MachineIssueData) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const machineStatus = await prisma.machineStatus.create({
            data: {
                ...data,
                reportedBy: session.user.employeeId
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true, machineStatus };
    } catch (error) {
        console.error("Failed to report machine issue:", error);
        return { error: "Failed to report machine issue" };
    }
}

export async function getMachineStatus(machineId?: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const machineStatuses = await prisma.machineStatus.findMany({
            where: machineId ? { id: machineId } : {},
            include: {
                reporter: {
                    select: {
                        name: true
                    }
                },
                resolver: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                reportedAt: 'desc'
            },
            take: machineId ? 1 : 50
        });

        return { machineStatuses };
    } catch (error) {
        console.error("Failed to get machine status:", error);
        return { error: "Failed to get machine status" };
    }
}

export async function getMachineHistory(filters?: {
    startDate?: Date;
    endDate?: Date;
    stage?: ProductionStage;
}) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const machineHistory = await prisma.machineStatus.findMany({
            where: {
                reportedBy: session.user.employeeId,
                ...(filters?.startDate && filters?.endDate ? {
                    reportedAt: {
                        gte: filters.startDate,
                        lte: filters.endDate
                    }
                } : {}),
                ...(filters?.stage ? { stage: filters.stage } : {})
            },
            include: {
                resolver: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                reportedAt: 'desc'
            }
        });

        return { machineHistory };
    } catch (error) {
        console.error("Failed to get machine history:", error);
        return { error: "Failed to get machine history" };
    }
}

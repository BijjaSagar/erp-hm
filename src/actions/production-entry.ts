"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ProductionStage } from "@prisma/client";

/**
 * Start a new production entry
 * Called when an operator begins work on a stage
 */
export async function startProductionEntry(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const orderId = formData.get("orderId") as string;
        const machineId = formData.get("machineId") as string;
        const operatorId = formData.get("operatorId") as string;
        const stage = formData.get("stage") as ProductionStage;
        const inputQuantity = parseInt(formData.get("inputQuantity") as string);

        if (!orderId || !machineId || !operatorId || !stage || !inputQuantity) {
            return { message: "All fields are required" };
        }

        // Check if there's already an active entry for this order and stage
        const existingEntry = await prisma.productionEntry.findFirst({
            where: {
                orderId,
                stage,
                endTime: null, // Active entry
            },
        });

        if (existingEntry) {
            return { message: "There is already an active production entry for this stage" };
        }

        // Create production entry
        const entry = await prisma.productionEntry.create({
            data: {
                orderId,
                machineId,
                operatorId,
                stage,
                inputQuantity,
                outputQuantity: 0, // Will be updated on completion
                startTime: new Date(),
            },
            include: {
                machine: true,
                operator: true,
                order: true,
            },
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/operator");
        revalidatePath(`/dashboard/orders/${orderId}`);

        return {
            message: "Production entry started successfully",
            entryId: entry.id,
        };
    } catch (error) {
        console.error("Error starting production entry:", error);
        return { message: "Failed to start production entry" };
    }
}

/**
 * Complete a production entry
 * Called when an operator finishes work on a stage
 */
export async function completeProductionEntry(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const entryId = formData.get("entryId") as string;
        const outputQuantity = parseInt(formData.get("outputQuantity") as string);
        const rejectedQuantity = parseInt(formData.get("rejectedQuantity") as string) || 0;
        const wastageQuantity = parseFloat(formData.get("wastageQuantity") as string) || 0;
        const qualityNotes = formData.get("qualityNotes") as string;

        if (!entryId || outputQuantity === undefined) {
            return { message: "Entry ID and output quantity are required" };
        }

        // Get the entry
        const entry = await prisma.productionEntry.findUnique({
            where: { id: entryId },
            include: { order: true },
        });

        if (!entry) {
            return { message: "Production entry not found" };
        }

        if (entry.endTime) {
            return { message: "This production entry is already completed" };
        }

        // Validate quantities
        if (outputQuantity + rejectedQuantity > entry.inputQuantity) {
            return { message: "Output + Rejected cannot exceed Input quantity" };
        }

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - entry.startTime.getTime()) / 60000); // Minutes

        // Calculate wastage percentage
        const wastagePercentage = entry.inputQuantity > 0
            ? (wastageQuantity / entry.inputQuantity) * 100
            : 0;

        // Update production entry
        await prisma.productionEntry.update({
            where: { id: entryId },
            data: {
                outputQuantity,
                rejectedQuantity,
                wastageQuantity,
                wastagePercentage,
                endTime,
                duration,
                qualityNotes: qualityNotes || undefined,
            },
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/operator");
        revalidatePath(`/dashboard/orders/${entry.orderId}`);

        return {
            message: "Production entry completed successfully",
            orderId: entry.orderId,
        };
    } catch (error) {
        console.error("Error completing production entry:", error);
        return { message: "Failed to complete production entry" };
    }
}

/**
 * Approve a production entry (Supervisor action)
 */
export async function approveProductionEntry(
    entryId: string,
    approvedBy: string,
    notes?: string
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const entry = await prisma.productionEntry.update({
            where: { id: entryId },
            data: {
                qualityApproved: true,
                approvedBy,
                approvedAt: new Date(),
                qualityNotes: notes || undefined,
            },
            include: {
                order: true,
            },
        });

        // Move order to next stage after approval
        const stages = Object.values(ProductionStage);
        const currentStageIndex = stages.indexOf(entry.stage);
        const nextStage = currentStageIndex < stages.length - 1
            ? stages[currentStageIndex + 1]
            : ProductionStage.COMPLETED;

        await prisma.order.update({
            where: { id: entry.orderId },
            data: {
                currentStage: nextStage,
                status: nextStage === ProductionStage.COMPLETED
                    ? "COMPLETED"
                    : "IN_PRODUCTION",
            },
        });

        // Create production log
        await prisma.productionLog.create({
            data: {
                orderId: entry.orderId,
                stage: entry.stage,
                status: "Completed",
                employeeId: entry.operatorId,
                notes: `Approved by supervisor. Output: ${entry.outputQuantity}, Rejected: ${entry.rejectedQuantity}`,
            },
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/approvals");
        revalidatePath(`/dashboard/orders/${entry.orderId}`);

        return { message: "Production entry approved successfully" };
    } catch (error) {
        console.error("Error approving production entry:", error);
        return { message: "Failed to approve production entry" };
    }
}

/**
 * Get all production entries for an order
 */
export async function getProductionEntriesByOrder(orderId: string) {
    try {
        const entries = await prisma.productionEntry.findMany({
            where: { orderId },
            include: {
                machine: true,
                operator: true,
                approver: true,
                materialConsumptions: {
                    include: {
                        material: true,
                        employee: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        return entries;
    } catch (error) {
        console.error("Error fetching production entries:", error);
        return [];
    }
}

/**
 * Get active production entries (ongoing work)
 */
export async function getActiveProductionEntries(operatorId?: string) {
    try {
        const where: any = {
            endTime: null, // Not completed yet
        };

        if (operatorId) {
            where.operatorId = operatorId;
        }

        const entries = await prisma.productionEntry.findMany({
            where,
            include: {
                machine: true,
                operator: true,
                order: {
                    include: {
                        items: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        return entries;
    } catch (error) {
        console.error("Error fetching active production entries:", error);
        return [];
    }
}

/**
 * Get pending approvals (for supervisors)
 */
export async function getPendingApprovals() {
    try {
        const entries = await prisma.productionEntry.findMany({
            where: {
                endTime: { not: null }, // Completed
                qualityApproved: false, // Not yet approved
            },
            include: {
                machine: true,
                operator: true,
                order: {
                    include: {
                        items: true,
                    },
                },
                materialConsumptions: {
                    include: {
                        material: true,
                    },
                },
            },
            orderBy: {
                endTime: "desc",
            },
        });

        return entries;
    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        return [];
    }
}

/**
 * Get production entry by ID
 */
export async function getProductionEntryById(id: string) {
    try {
        const entry = await prisma.productionEntry.findUnique({
            where: { id },
            include: {
                machine: true,
                operator: true,
                approver: true,
                order: {
                    include: {
                        items: true,
                        branch: true,
                    },
                },
                materialConsumptions: {
                    include: {
                        material: true,
                        employee: true,
                    },
                },
            },
        });

        return entry;
    } catch (error) {
        console.error("Error fetching production entry:", error);
        return null;
    }
}

/**
 * Get production statistics
 */
export async function getProductionEntryStats() {
    try {
        const [
            totalEntries,
            activeEntries,
            pendingApprovals,
            approvedToday,
        ] = await Promise.all([
            prisma.productionEntry.count(),
            prisma.productionEntry.count({
                where: { endTime: null },
            }),
            prisma.productionEntry.count({
                where: {
                    endTime: { not: null },
                    qualityApproved: false,
                },
            }),
            prisma.productionEntry.count({
                where: {
                    approvedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);

        return {
            totalEntries,
            activeEntries,
            pendingApprovals,
            approvedToday,
        };
    } catch (error) {
        console.error("Error fetching production entry stats:", error);
        return {
            totalEntries: 0,
            activeEntries: 0,
            pendingApprovals: 0,
            approvedToday: 0,
        };
    }
}

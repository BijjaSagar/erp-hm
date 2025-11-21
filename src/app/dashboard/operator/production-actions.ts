'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ProductionStage } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function startProductionSession(machineId: string, orderId: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        // Check if operator already has an active session
        const activeSession = await prisma.productionEntry.findFirst({
            where: {
                operatorId: session.user.employeeId,
                endTime: null
            }
        });

        if (activeSession) {
            return { error: "You already have an active production session. Please end it first." };
        }

        // Get machine details to set the stage
        const machine = await prisma.machine.findUnique({
            where: { id: machineId }
        });

        if (!machine) {
            return { error: "Machine not found" };
        }

        // Create new production entry
        const productionEntry = await prisma.productionEntry.create({
            data: {
                machineId,
                orderId,
                operatorId: session.user.employeeId,
                stage: machine.stage,
                inputQuantity: 0, // Will be updated when ending session or during
                outputQuantity: 0,
                startTime: new Date(),
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true, productionEntry };
    } catch (error) {
        console.error("Failed to start production session:", error);
        return { error: "Failed to start production session" };
    }
}

export async function endProductionSession(
    entryId: string,
    data: {
        inputQuantity: number;
        outputQuantity: number;
        rejectedQuantity: number;
        wastageQuantity: number;
        materialsUsed?: any;
        qualityNotes?: string;
    }
) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const entry = await prisma.productionEntry.findUnique({
            where: { id: entryId }
        });

        if (!entry) {
            return { error: "Production entry not found" };
        }

        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - entry.startTime.getTime()) / 60000); // Minutes

        // Update production entry
        // Use transaction to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            // Update production entry
            const updatedEntry = await tx.productionEntry.update({
                where: { id: entryId },
                data: {
                    ...data,
                    endTime,
                    duration,
                    wastagePercentage: data.inputQuantity > 0
                        ? (data.wastageQuantity / data.inputQuantity) * 100
                        : 0
                }
            });

            // If materials used provided, create consumption records and update stock
            if (data.materialsUsed && Array.isArray(data.materialsUsed)) {
                for (const m of data.materialsUsed) {
                    // Create consumption record
                    await tx.materialConsumption.create({
                        data: {
                            productionEntryId: entryId,
                            orderId: entry.orderId,
                            materialId: m.materialId,
                            materialType: m.materialType,
                            quantity: m.quantity,
                            unit: m.unit,
                            stage: entry.stage,
                            consumedBy: session.user.employeeId!,
                        }
                    });

                    // Deduct from inventory
                    await tx.inventoryItem.update({
                        where: { id: m.materialId },
                        data: {
                            quantity: {
                                decrement: m.quantity
                            }
                        }
                    });

                    // Log stock transaction
                    await tx.stockTransaction.create({
                        data: {
                            itemId: m.materialId,
                            quantity: m.quantity,
                            type: 'OUT',
                            userId: session.user.id!, // Assuming user.id is available in session
                        }
                    });
                }
            }

            return updatedEntry;
        });

        revalidatePath('/dashboard/operator');
        return { success: true, productionEntry: result };
    } catch (error) {
        console.error("Failed to end production session:", error);
        return { error: "Failed to end production session" };
    }
}

export async function getActiveProductionSession() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const activeSession = await prisma.productionEntry.findFirst({
            where: {
                operatorId: session.user.employeeId,
                endTime: null
            },
            include: {
                machine: true,
                order: true
            }
        });

        return { activeSession };
    } catch (error) {
        console.error("Failed to get active session:", error);
        return { error: "Failed to get active session" };
    }
}

export async function getOperatorMachines() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        // Get employee's assigned stages/department
        const employee = await prisma.employee.findUnique({
            where: { id: session.user.employeeId },
            select: { branchId: true, assignedStages: true }
        });

        if (!employee) return { error: "Employee not found" };

        // Fetch machines matching employee's branch and assigned stages
        // If no assigned stages, fetch all in branch (or handle as needed)
        const whereClause: any = {
            branchId: employee.branchId,
            isActive: true
        };

        if (employee.assignedStages && employee.assignedStages.length > 0) {
            whereClause.stage = { in: employee.assignedStages };
        }

        const machines = await prisma.machine.findMany({
            where: whereClause,
            orderBy: { name: 'asc' }
        });

        return { machines };
    } catch (error) {
        console.error("Failed to fetch operator machines:", error);
        return { error: "Failed to fetch machines" };
    }
}

export async function getAvailableMaterials(stage: ProductionStage) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        // Define material categories based on stage
        // This is a simplified mapping, can be expanded
        let categories: string[] = [];
        switch (stage) {
            case ProductionStage.CUTTING:
                categories = ['RAW_MATERIAL', 'SHEET'];
                break;
            case ProductionStage.WELDING_INNER:
            case ProductionStage.WELDING_OUTER:
                categories = ['CONSUMABLE', 'WELDING'];
                break;
            case ProductionStage.PAINTING:
                categories = ['PAINT', 'POWDER'];
                break;
            case ProductionStage.FINISHING:
                categories = ['HARDWARE', 'PACKAGING'];
                break;
            default:
                categories = ['CONSUMABLE'];
        }

        const materials = await prisma.inventoryItem.findMany({
            where: {
                category: { in: categories }
            },
            select: {
                id: true,
                name: true,
                unit: true,
                quantity: true
            }
        });

        return { materials };
    } catch (error) {
        console.error("Failed to fetch materials:", error);
        return { error: "Failed to fetch materials" };
    }
}

export async function getProductionInput(orderId: string, currentStage: ProductionStage) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        // Determine previous stage
        const stages = Object.values(ProductionStage);
        const currentIndex = stages.indexOf(currentStage);

        if (currentIndex <= 0) {
            // First stage (Cutting), input is raw material, so return 0 or handle differently
            // For now, we can return a high number or 0 to indicate "unlimited" or "check stock"
            return { inputQuantity: 0, isFirstStage: true };
        }

        const previousStage = stages[currentIndex - 1];

        // Sum output from previous stage
        const previousOutput = await prisma.productionEntry.aggregate({
            where: {
                orderId,
                stage: previousStage
            },
            _sum: {
                outputQuantity: true
            }
        });

        // Sum input already processed in current stage
        const currentInput = await prisma.productionEntry.aggregate({
            where: {
                orderId,
                stage: currentStage
            },
            _sum: {
                inputQuantity: true
            }
        });

        const totalInput = previousOutput._sum.outputQuantity || 0;
        const usedInput = currentInput._sum.inputQuantity || 0;
        const availableInput = Math.max(0, totalInput - usedInput);

        return { inputQuantity: availableInput, isFirstStage: false };
    } catch (error) {
        console.error("Failed to fetch production input:", error);
        return { error: "Failed to fetch production input" };
    }
}

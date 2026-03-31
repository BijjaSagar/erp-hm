"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { MaterialType, ProductionStage } from "@prisma/client";

/**
 * Record material consumption
 */
export async function recordMaterialConsumption(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const productionEntryId = formData.get("productionEntryId") as string;
        const orderId = formData.get("orderId") as string;
        const materialId = formData.get("materialId") as string;
        const materialType = formData.get("materialType") as MaterialType;
        const quantity = parseFloat(formData.get("quantity") as string);
        const unit = formData.get("unit") as string;
        const stage = formData.get("stage") as ProductionStage;
        const consumedBy = formData.get("consumedBy") as string;
        const notes = formData.get("notes") as string;

        if (!orderId || !materialId || !materialType || !quantity || !unit || !stage || !consumedBy) {
            return { message: "All required fields must be provided" };
        }

        // Get current inventory
        const rawMaterial = await prisma.rawMaterial.findUnique({
            where: { id: materialId },
        });

        if (!rawMaterial) {
            return { message: "Material not found in inventory" };
        }

        // --- NEW LOGIC TO HANDLE ALLOCATIONS ---
        
        // Find existing allocations for this order and material
        const allocations = await prisma.materialAllocation.findMany({
            where: {
                orderId,
                materialId,
            },
        });

        const totalAllocated = allocations.reduce((sum, a) => sum + a.quantity, 0);

        // Find previous consumptions for this order and material (excluding current)
        const previousConsumptions = await prisma.materialConsumption.findMany({
            where: {
                orderId,
                materialId,
            },
        });

        const totalPreviousConsumed = previousConsumptions.reduce((sum, c) => sum + c.quantity, 0);
        const remainingAllocation = Math.max(0, totalAllocated - totalPreviousConsumed);

        let stockAdjustment = 0;
        
        if (remainingAllocation > 0) {
            // We have an allocation that already deducted from general stock.
            if (quantity > remainingAllocation) {
                // This consumption exceeds the allocation.
                // We draw the remaining allocation (no deduction) and deduct the excess from general stock.
                stockAdjustment = -(quantity - remainingAllocation);
            } else {
                // This consumption is fully covered by the remaining allocation.
                // Since the full allocation was already deducted from stock, 
                // we do nothing to the general stock. The allocation handles it.
                stockAdjustment = 0;
            }
        } else {
            // No allocation, or it's already used up. Deduct full quantity from stock.
            stockAdjustment = -quantity;
        }

        if (stockAdjustment < 0 && rawMaterial.quantity < Math.abs(stockAdjustment)) {
            return {
                message: `Insufficient inventory. Available: ${rawMaterial.quantity} ${unit}, Requested deduction: ${Math.abs(stockAdjustment)} ${unit}`,
            };
        }

        // Create material consumption record
        const consumption = await prisma.materialConsumption.create({
            data: {
                productionEntryId: productionEntryId || undefined,
                orderId,
                materialId,
                materialType,
                quantity,
                unit,
                stage,
                consumedBy,
                notes: notes || undefined,
            },
            include: {
                material: true,
                employee: true,
            },
        });

        // Update inventory based on calculated adjustment
        if (stockAdjustment < 0) {
            await prisma.rawMaterial.update({
                where: { id: materialId },
                data: {
                    quantity: {
                        decrement: Math.abs(stockAdjustment),
                    },
                },
            });

            // Create stock transaction record for the decrement
            await prisma.stockTransaction.create({
                data: {
                    itemId: materialId,
                    quantity: Math.abs(stockAdjustment),
                    type: "OUT",
                    userId: consumedBy,
                },
            });
        }

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/production");
        revalidatePath(`/dashboard/orders/${orderId}`);

        return {
            message: "Material consumption recorded successfully",
            consumptionId: consumption.id,
        };
    } catch (error) {
        console.error("Error recording material consumption:", error);
        return { message: "Failed to record material consumption" };
    }
}

/**
 * Get material consumption by production entry
 */
export async function getMaterialConsumptionByEntry(productionEntryId: string) {
    try {
        const consumptions = await prisma.materialConsumption.findMany({
            where: { productionEntryId },
            include: {
                material: true,
                employee: true,
            },
            orderBy: {
                consumedAt: "desc",
            },
        });

        return consumptions;
    } catch (error) {
        console.error("Error fetching material consumption:", error);
        return [];
    }
}

/**
 * Get material consumption by order
 */
export async function getMaterialConsumptionByOrder(orderId: string) {
    try {
        const consumptions = await prisma.materialConsumption.findMany({
            where: { orderId },
            include: {
                material: true,
                employee: true,
                productionEntry: {
                    include: {
                        machine: true,
                    },
                },
            },
            orderBy: {
                consumedAt: "desc",
            },
        });

        return consumptions;
    } catch (error) {
        console.error("Error fetching material consumption:", error);
        return [];
    }
}

/**
 * Get material consumption by stage
 */
export async function getMaterialConsumptionByStage(
    orderId: string,
    stage: ProductionStage
) {
    try {
        const consumptions = await prisma.materialConsumption.findMany({
            where: {
                orderId,
                stage,
            },
            include: {
                material: true,
                employee: true,
            },
            orderBy: {
                consumedAt: "desc",
            },
        });

        return consumptions;
    } catch (error) {
        console.error("Error fetching material consumption by stage:", error);
        return [];
    }
}

/**
 * Get material consumption summary for an order
 */
export async function getMaterialConsumptionSummary(orderId: string) {
    try {
        const consumptions = await prisma.materialConsumption.findMany({
            where: { orderId },
            include: {
                material: true,
            },
        });

        // Group by material and sum quantities
        const summary = consumptions.reduce((acc, consumption) => {
            const key = consumption.materialId;
            if (!acc[key]) {
                acc[key] = {
                    materialId: consumption.materialId,
                    materialName: consumption.material.name,
                    materialType: consumption.materialType,
                    unit: consumption.unit,
                    totalQuantity: 0,
                    stages: [] as ProductionStage[],
                };
            }
            acc[key].totalQuantity += consumption.quantity;
            if (!acc[key].stages.includes(consumption.stage)) {
                acc[key].stages.push(consumption.stage);
            }
            return acc;
        }, {} as Record<string, any>);

        return Object.values(summary);
    } catch (error) {
        console.error("Error fetching material consumption summary:", error);
        return [];
    }
}

/**
 * Get low stock materials
 */
export async function getLowStockMaterials() {
    try {
        const materials = await prisma.rawMaterial.findMany({
            where: {
                OR: [
                    {
                        AND: [
                            { reorderLevel: { not: null } },
                            {
                                quantity: {
                                    lte: prisma.rawMaterial.fields.reorderLevel,
                                },
                            },
                        ],
                    },
                    {
                        quantity: {
                            lte: 10, // Default low stock threshold
                        },
                    },
                ],
            },
            orderBy: {
                quantity: "asc",
            },
        });

        return materials;
    } catch (error) {
        console.error("Error fetching low stock materials:", error);
        return [];
    }
}

/**
 * Get material consumption statistics
 */
export async function getMaterialConsumptionStats(startDate?: Date, endDate?: Date) {
    try {
        const where: any = {};

        if (startDate || endDate) {
            where.consumedAt = {};
            if (startDate) where.consumedAt.gte = startDate;
            if (endDate) where.consumedAt.lte = endDate;
        }

        const [
            totalConsumptions,
            totalValue,
            byMaterialType,
            byStage,
        ] = await Promise.all([
            // Total consumption records
            prisma.materialConsumption.count({ where }),

            // Total value (approximate)
            prisma.materialConsumption.findMany({
                where,
                include: {
                    material: true,
                },
            }).then(consumptions =>
                consumptions.reduce((sum, c) => {
                    const material = c.material as any;
                    const price = material.currentPrice || material.price || 0;
                    return sum + (c.quantity * price);
                }, 0)
            ),

            // By material type
            prisma.materialConsumption.groupBy({
                by: ['materialType'],
                where,
                _sum: {
                    quantity: true,
                },
                _count: true,
            }),

            // By stage
            prisma.materialConsumption.groupBy({
                by: ['stage'],
                where,
                _sum: {
                    quantity: true,
                },
                _count: true,
            }),
        ]);

        return {
            totalConsumptions,
            totalValue,
            byMaterialType,
            byStage,
        };
    } catch (error) {
        console.error("Error fetching material consumption stats:", error);
        return {
            totalConsumptions: 0,
            totalValue: 0,
            byMaterialType: [],
            byStage: [],
        };
    }
}

/**
 * Bulk record material consumption (for multiple materials at once)
 */
export async function bulkRecordMaterialConsumption(
    materials: Array<{
        materialId: string;
        materialType: MaterialType;
        quantity: number;
        unit: string;
        notes?: string;
    }>,
    productionEntryId: string | null,
    orderId: string,
    stage: ProductionStage,
    consumedBy: string
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const results = [];

        for (const material of materials) {
            // Check inventory
            const rawMaterial = await prisma.rawMaterial.findUnique({
                where: { id: material.materialId },
            });

            if (!rawMaterial) {
                results.push({
                    materialId: material.materialId,
                    success: false,
                    message: "Material not found",
                });
                continue;
            }

            // Check existing allocations for this order and material
            const allocations = await prisma.materialAllocation.findMany({
                where: {
                    orderId,
                    materialId: material.materialId,
                },
            });

            const totalAllocated = allocations.reduce((sum, a) => sum + a.quantity, 0);

            // Find previous consumptions for this order and material (excluding current)
            const previousConsumptions = await prisma.materialConsumption.findMany({
                where: {
                    orderId,
                    materialId: material.materialId,
                },
            });

            const totalPreviousConsumed = previousConsumptions.reduce((sum, c) => sum + c.quantity, 0);
            const remainingAllocation = Math.max(0, totalAllocated - totalPreviousConsumed);

            let stockAdjustment = 0;
            if (remainingAllocation > 0) {
                if (material.quantity > remainingAllocation) {
                    stockAdjustment = -(material.quantity - remainingAllocation);
                } else {
                    stockAdjustment = 0;
                }
            } else {
                stockAdjustment = -material.quantity;
            }

            if (stockAdjustment < 0 && rawMaterial.quantity < Math.abs(stockAdjustment)) {
                results.push({
                    materialId: material.materialId,
                    success: false,
                    message: `Insufficient inventory. Available: ${rawMaterial.quantity}`,
                });
                continue;
            }

            // Create consumption record
            await prisma.materialConsumption.create({
                data: {
                    productionEntryId: productionEntryId || undefined,
                    orderId,
                    materialId: material.materialId,
                    materialType: material.materialType,
                    quantity: material.quantity,
                    unit: material.unit,
                    stage,
                    consumedBy,
                    notes: material.notes,
                },
            });

            // Update inventory and log transaction if needed
            if (stockAdjustment < 0) {
                await prisma.rawMaterial.update({
                    where: { id: material.materialId },
                    data: {
                        quantity: {
                            decrement: Math.abs(stockAdjustment),
                        },
                    },
                });

                await prisma.stockTransaction.create({
                    data: {
                        itemId: material.materialId,
                        quantity: Math.abs(stockAdjustment),
                        type: "OUT",
                        userId: consumedBy,
                    },
                });
            }

            results.push({
                materialId: material.materialId,
                success: true,
                message: "Recorded successfully",
            });
        }

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/production");
        revalidatePath(`/dashboard/orders/${orderId}`);

        const successCount = results.filter(r => r.success).length;
        return {
            message: `${successCount} of ${materials.length} materials recorded successfully`,
            results,
        };
    } catch (error) {
        console.error("Error bulk recording material consumption:", error);
        return { message: "Failed to record material consumption" };
    }
}

/**
 * Reconcile material allocations for an order
 * Returns leftovers to general stock when order is completed
 */
export async function reconcileOrderMaterials(orderId: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        // 1. Get all allocations for this order
        const allocations = await prisma.materialAllocation.findMany({
            where: { orderId },
        });

        if (allocations.length === 0) return { message: "No allocations to reconcile" };

        // 2. Get all consumptions for this order
        const consumptions = await prisma.materialConsumption.findMany({
            where: { orderId },
        });

        // 3. Group by material
        const allocationMap = allocations.reduce((acc, a) => {
            acc[a.materialId] = (acc[a.materialId] || 0) + a.quantity;
            return acc;
        }, {} as Record<string, number>);

        const consumptionMap = consumptions.reduce((acc, c) => {
            acc[c.materialId] = (acc[c.materialId] || 0) + c.quantity;
            return acc;
        }, {} as Record<string, number>);

        // 4. Calculate leftovers and update stock
        const results = [];
        for (const [materialId, totalAllocated] of Object.entries(allocationMap)) {
            const totalConsumed = consumptionMap[materialId] || 0;
            const leftover = totalAllocated - totalConsumed;

            if (leftover > 0) {
                // Return to general stock
                await prisma.rawMaterial.update({
                    where: { id: materialId },
                    data: {
                        quantity: {
                            increment: leftover,
                        },
                    },
                });

                // Log transaction
                await prisma.stockTransaction.create({
                    data: {
                        itemId: materialId,
                        quantity: leftover,
                        type: "IN",
                        userId: session.user.id!,
                        timestamp: new Date(),
                    },
                });

                // Add negative allocation to prevent double refund
                const unit = allocations.find(a => a.materialId === materialId)?.unit || 'units';
                await prisma.materialAllocation.create({
                    data: {
                        orderId,
                        materialId,
                        quantity: -leftover,
                        unit,
                        allocatedBy: session.user.id!,
                        notes: "Auto-reconciled unused allocation (Order Completed)",
                    }
                });

                results.push({ materialId, leftover, status: "refunded" });
            }
        }

        return {
            message: "Materials reconciled successfully",
            results,
        };
    } catch (error) {
        console.error("Error reconciling materials:", error);
        return { message: "Failed to reconcile materials" };
    }
}

/**
 * Reconcile materials used in a specific completed stage
 */
export async function reconcileMaterialsForStage(orderId: string, stage: ProductionStage, userId: string) {
    try {
        // 1. Find materials consumed in THIS stage
        const stageConsumptions = await prisma.materialConsumption.findMany({
            where: { orderId, stage }
        });
        
        if (stageConsumptions.length === 0) return { success: true, message: "No materials consumed in this stage" };

        const materialIds = Array.from(new Set(stageConsumptions.map(c => c.materialId)));

        // 2. Get all allocations and consumptions for these materials
        const allocations = await prisma.materialAllocation.findMany({
            where: { orderId, materialId: { in: materialIds } }
        });
        
        const allConsumptions = await prisma.materialConsumption.findMany({
            where: { orderId, materialId: { in: materialIds } }
        });
        
        const results = [];
        for (const materialId of materialIds) {
            const totalAllocated = allocations.filter(a => a.materialId === materialId).reduce((sum, a) => sum + a.quantity, 0);
            const totalConsumed = allConsumptions.filter(c => c.materialId === materialId).reduce((sum, c) => sum + c.quantity, 0);
            
            const leftover = totalAllocated - totalConsumed;
            
            if (leftover > 0) {
                // Return to stock
                await prisma.rawMaterial.update({
                    where: { id: materialId },
                    data: { quantity: { increment: leftover } }
                });
                
                // Log transaction
                await prisma.stockTransaction.create({
                    data: {
                        itemId: materialId,
                        quantity: leftover,
                        type: "IN",
                        userId,
                        timestamp: new Date(),
                    }
                });
                
                // Add negative allocation
                const unit = allocations.find(a => a.materialId === materialId)?.unit || 'units';
                await prisma.materialAllocation.create({
                    data: {
                        orderId,
                        materialId,
                        quantity: -leftover,
                        unit,
                        allocatedBy: userId,
                        notes: `Auto-reconciled unused allocation after ${stage} phase`,
                    }
                });
                
                results.push({ materialId, leftover, status: "refunded" });
            }
        }
        
        return { success: true, results };
    } catch (error) {
        console.error(`Error reconciling materials for stage ${stage}:`, error);
        return { success: false, message: "Failed to reconcile stage materials" };
    }
}

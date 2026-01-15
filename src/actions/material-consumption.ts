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
        const inventoryItem = await prisma.inventoryItem.findUnique({
            where: { id: materialId },
        });

        if (!inventoryItem) {
            return { message: "Material not found in inventory" };
        }

        if (inventoryItem.quantity < quantity) {
            return {
                message: `Insufficient inventory. Available: ${inventoryItem.quantity} ${unit}, Requested: ${quantity} ${unit}`,
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

        // Update inventory - deduct consumed quantity
        await prisma.inventoryItem.update({
            where: { id: materialId },
            data: {
                quantity: {
                    decrement: quantity,
                },
            },
        });

        // Create stock transaction record
        await prisma.stockTransaction.create({
            data: {
                itemId: materialId,
                quantity: -quantity, // Negative for consumption
                type: "OUT",
                userId: consumedBy,
            },
        });

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
        const materials = await prisma.inventoryItem.findMany({
            where: {
                OR: [
                    {
                        AND: [
                            { reorderLevel: { not: null } },
                            {
                                quantity: {
                                    lte: prisma.inventoryItem.fields.reorderLevel,
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
                consumptions.reduce((sum, c) =>
                    sum + (c.quantity * (c.material.price || 0)), 0
                )
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
            const inventoryItem = await prisma.inventoryItem.findUnique({
                where: { id: material.materialId },
            });

            if (!inventoryItem) {
                results.push({
                    materialId: material.materialId,
                    success: false,
                    message: "Material not found",
                });
                continue;
            }

            if (inventoryItem.quantity < material.quantity) {
                results.push({
                    materialId: material.materialId,
                    success: false,
                    message: `Insufficient inventory. Available: ${inventoryItem.quantity}`,
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

            // Update inventory
            await prisma.inventoryItem.update({
                where: { id: material.materialId },
                data: {
                    quantity: {
                        decrement: material.quantity,
                    },
                },
            });

            // Create stock transaction
            await prisma.stockTransaction.create({
                data: {
                    itemId: material.materialId,
                    quantity: -material.quantity,
                    type: "OUT",
                    userId: consumedBy,
                },
            });

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

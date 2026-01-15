"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Get all material usages
 */
export async function getMaterialUsages(
    startDate?: Date,
    endDate?: Date,
    materialId?: string
) {
    try {
        const where: any = {};

        if (startDate || endDate) {
            where.usedAt = {};
            if (startDate) where.usedAt.gte = startDate;
            if (endDate) where.usedAt.lte = endDate;
        }

        if (materialId) where.materialId = materialId;

        const usages = await prisma.rawMaterialUsage.findMany({
            where,
            include: {
                material: true,
            },
            orderBy: { usedAt: "desc" },
        });

        return usages;
    } catch (error) {
        console.error("Error fetching material usages:", error);
        return [];
    }
}

/**
 * Get usage by ID
 */
export async function getUsageById(id: string) {
    try {
        const usage = await prisma.rawMaterialUsage.findUnique({
            where: { id },
            include: {
                material: true,
            },
        });

        return usage;
    } catch (error) {
        console.error("Error fetching usage:", error);
        return null;
    }
}

/**
 * Record material usage
 */
export async function recordMaterialUsage(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const materialId = formData.get("materialId") as string;
        const quantity = parseFloat(formData.get("quantity") as string);
        const unit = formData.get("unit") as string;
        const usedFor = formData.get("usedFor") as string;
        const usedBy = formData.get("usedBy") as string;
        const usedAt = formData.get("usedAt")
            ? new Date(formData.get("usedAt") as string)
            : new Date();
        const notes = formData.get("notes") as string;

        if (!materialId || !quantity || !unit) {
            return { message: "Material, quantity, and unit are required" };
        }

        // Check if material has sufficient quantity
        const material = await prisma.rawMaterial.findUnique({
            where: { id: materialId },
        });

        if (!material) {
            return { message: "Material not found" };
        }

        if (material.quantity < quantity) {
            return {
                message: `Insufficient quantity. Available: ${material.quantity} ${unit}, Requested: ${quantity} ${unit}`,
            };
        }

        // Create usage record
        await prisma.rawMaterialUsage.create({
            data: {
                materialId,
                quantity,
                unit,
                usedFor: usedFor || undefined,
                usedBy: usedBy || undefined,
                usedAt,
                notes: notes || undefined,
            },
        });

        // Update material quantity
        await prisma.rawMaterial.update({
            where: { id: materialId },
            data: {
                quantity: {
                    decrement: quantity,
                },
            },
        });

        revalidatePath("/dashboard/marketing/usage");
        revalidatePath("/dashboard/marketing/raw-materials");
        return { message: "Material usage recorded successfully" };
    } catch (error) {
        console.error("Error recording material usage:", error);
        return { message: "Failed to record material usage" };
    }
}

/**
 * Update material usage
 */
export async function updateMaterialUsage(
    id: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const materialId = formData.get("materialId") as string;
        const quantity = parseFloat(formData.get("quantity") as string);
        const unit = formData.get("unit") as string;
        const usedFor = formData.get("usedFor") as string;
        const usedBy = formData.get("usedBy") as string;
        const usedAt = formData.get("usedAt")
            ? new Date(formData.get("usedAt") as string)
            : new Date();
        const notes = formData.get("notes") as string;

        if (!materialId || !quantity || !unit) {
            return { message: "Material, quantity, and unit are required" };
        }

        // Get old usage to adjust material quantity
        const oldUsage = await prisma.rawMaterialUsage.findUnique({
            where: { id },
        });

        if (!oldUsage) {
            return { message: "Usage record not found" };
        }

        // Update usage
        await prisma.rawMaterialUsage.update({
            where: { id },
            data: {
                materialId,
                quantity,
                unit,
                usedFor: usedFor || undefined,
                usedBy: usedBy || undefined,
                usedAt,
                notes: notes || undefined,
            },
        });

        // Adjust material quantity (add back old, subtract new)
        if (oldUsage.materialId === materialId) {
            const quantityDiff = quantity - oldUsage.quantity;
            await prisma.rawMaterial.update({
                where: { id: materialId },
                data: {
                    quantity: {
                        decrement: quantityDiff,
                    },
                },
            });
        } else {
            // Material changed, adjust both
            await prisma.rawMaterial.update({
                where: { id: oldUsage.materialId },
                data: {
                    quantity: {
                        increment: oldUsage.quantity,
                    },
                },
            });
            await prisma.rawMaterial.update({
                where: { id: materialId },
                data: {
                    quantity: {
                        decrement: quantity,
                    },
                },
            });
        }

        revalidatePath("/dashboard/marketing/usage");
        revalidatePath("/dashboard/marketing/raw-materials");
        return { message: "Material usage updated successfully" };
    } catch (error) {
        console.error("Error updating material usage:", error);
        return { message: "Failed to update material usage" };
    }
}

/**
 * Delete material usage
 */
export async function deleteMaterialUsage(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const usage = await prisma.rawMaterialUsage.findUnique({
            where: { id },
        });

        if (!usage) {
            return { message: "Usage record not found" };
        }

        // Add back the quantity to material
        await prisma.rawMaterial.update({
            where: { id: usage.materialId },
            data: {
                quantity: {
                    increment: usage.quantity,
                },
            },
        });

        // Delete usage
        await prisma.rawMaterialUsage.delete({
            where: { id },
        });

        revalidatePath("/dashboard/marketing/usage");
        revalidatePath("/dashboard/marketing/raw-materials");
        return { message: "Material usage deleted successfully" };
    } catch (error) {
        console.error("Error deleting material usage:", error);
        return { message: "Failed to delete material usage" };
    }
}

/**
 * Get material usage statistics
 */
export async function getMaterialUsageStats(startDate?: Date, endDate?: Date) {
    try {
        const where: any = {};

        if (startDate || endDate) {
            where.usedAt = {};
            if (startDate) where.usedAt.gte = startDate;
            if (endDate) where.usedAt.lte = endDate;
        }

        const [
            totalUsages,
            byMaterial,
            byPurpose,
        ] = await Promise.all([
            prisma.rawMaterialUsage.count({ where }),
            prisma.rawMaterialUsage.groupBy({
                by: ["materialId"],
                where,
                _sum: {
                    quantity: true,
                },
                _count: true,
            }),
            prisma.rawMaterialUsage.groupBy({
                by: ["usedFor"],
                where,
                _count: true,
            }),
        ]);

        return {
            totalUsages,
            byMaterial,
            byPurpose,
        };
    } catch (error) {
        console.error("Error fetching material usage stats:", error);
        return {
            totalUsages: 0,
            byMaterial: [],
            byPurpose: [],
        };
    }
}

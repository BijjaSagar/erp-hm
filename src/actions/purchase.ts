"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Get all purchases
 */
export async function getRawMaterialPurchases(
    startDate?: Date,
    endDate?: Date,
    sellerId?: string,
    materialId?: string
) {
    try {
        const where: any = {};

        if (startDate || endDate) {
            where.purchaseDate = {};
            if (startDate) where.purchaseDate.gte = startDate;
            if (endDate) where.purchaseDate.lte = endDate;
        }

        if (sellerId) where.sellerId = sellerId;
        if (materialId) where.materialId = materialId;

        const purchases = await prisma.rawMaterialPurchase.findMany({
            where,
            include: {
                seller: true,
                material: true,
            },
            orderBy: { purchaseDate: "desc" },
        });

        return purchases;
    } catch (error) {
        console.error("Error fetching purchases:", error);
        return [];
    }
}

/**
 * Get purchase by ID
 */
export async function getPurchaseById(id: string) {
    try {
        const purchase = await prisma.rawMaterialPurchase.findUnique({
            where: { id },
            include: {
                seller: true,
                material: true,
            },
        });

        return purchase;
    } catch (error) {
        console.error("Error fetching purchase:", error);
        return null;
    }
}

/**
 * Create purchase
 */
export async function createPurchase(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const sellerId = formData.get("sellerId") as string;
        const materialId = formData.get("materialId") as string;
        const quantity = parseFloat(formData.get("quantity") as string);
        const unit = formData.get("unit") as string;
        const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string);
        const transportationCost = parseFloat(formData.get("transportationCost") as string) || 0;
        const billNumber = formData.get("billNumber") as string;
        const billDate = formData.get("billDate")
            ? new Date(formData.get("billDate") as string)
            : undefined;
        const purchaseDate = formData.get("purchaseDate")
            ? new Date(formData.get("purchaseDate") as string)
            : new Date();
        const notes = formData.get("notes") as string;

        if (!sellerId || !materialId || !quantity || !unit || !pricePerUnit) {
            return { message: "All required fields must be provided" };
        }

        const totalPrice = quantity * pricePerUnit;
        const grandTotal = totalPrice + transportationCost;

        // Create purchase record
        const purchase = await prisma.rawMaterialPurchase.create({
            data: {
                sellerId,
                materialId,
                quantity,
                unit,
                pricePerUnit,
                totalPrice,
                transportationCost,
                grandTotal,
                billNumber: billNumber || undefined,
                billDate,
                purchaseDate,
                notes: notes || undefined,
            },
        });

        // Update raw material quantity and price
        await prisma.rawMaterial.update({
            where: { id: materialId },
            data: {
                quantity: {
                    increment: quantity,
                },
                currentPrice: pricePerUnit,
            },
        });

        revalidatePath("/dashboard/marketing/purchases");
        revalidatePath("/dashboard/marketing/raw-materials");
        return {
            message: "Purchase recorded successfully",
            purchaseId: purchase.id,
        };
    } catch (error) {
        console.error("Error creating purchase:", error);
        return { message: "Failed to record purchase" };
    }
}

/**
 * Update purchase
 */
export async function updatePurchase(
    id: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const sellerId = formData.get("sellerId") as string;
        const materialId = formData.get("materialId") as string;
        const quantity = parseFloat(formData.get("quantity") as string);
        const unit = formData.get("unit") as string;
        const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string);
        const transportationCost = parseFloat(formData.get("transportationCost") as string) || 0;
        const billNumber = formData.get("billNumber") as string;
        const billDate = formData.get("billDate")
            ? new Date(formData.get("billDate") as string)
            : undefined;
        const purchaseDate = formData.get("purchaseDate")
            ? new Date(formData.get("purchaseDate") as string)
            : new Date();
        const notes = formData.get("notes") as string;

        if (!sellerId || !materialId || !quantity || !unit || !pricePerUnit) {
            return { message: "All required fields must be provided" };
        }

        // Get old purchase to adjust material quantity
        const oldPurchase = await prisma.rawMaterialPurchase.findUnique({
            where: { id },
        });

        if (!oldPurchase) {
            return { message: "Purchase not found" };
        }

        const totalPrice = quantity * pricePerUnit;
        const grandTotal = totalPrice + transportationCost;

        // Update purchase
        await prisma.rawMaterialPurchase.update({
            where: { id },
            data: {
                sellerId,
                materialId,
                quantity,
                unit,
                pricePerUnit,
                totalPrice,
                transportationCost,
                grandTotal,
                billNumber: billNumber || undefined,
                billDate,
                purchaseDate,
                notes: notes || undefined,
            },
        });

        // Adjust material quantity (remove old, add new)
        if (oldPurchase.materialId === materialId) {
            const quantityDiff = quantity - oldPurchase.quantity;
            await prisma.rawMaterial.update({
                where: { id: materialId },
                data: {
                    quantity: {
                        increment: quantityDiff,
                    },
                    currentPrice: pricePerUnit,
                },
            });
        } else {
            // Material changed, adjust both
            await prisma.rawMaterial.update({
                where: { id: oldPurchase.materialId },
                data: {
                    quantity: {
                        decrement: oldPurchase.quantity,
                    },
                },
            });
            await prisma.rawMaterial.update({
                where: { id: materialId },
                data: {
                    quantity: {
                        increment: quantity,
                    },
                    currentPrice: pricePerUnit,
                },
            });
        }

        revalidatePath("/dashboard/marketing/purchases");
        revalidatePath("/dashboard/marketing/raw-materials");
        return { message: "Purchase updated successfully" };
    } catch (error) {
        console.error("Error updating purchase:", error);
        return { message: "Failed to update purchase" };
    }
}

/**
 * Delete purchase
 */
export async function deletePurchase(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const purchase = await prisma.rawMaterialPurchase.findUnique({
            where: { id },
        });

        if (!purchase) {
            return { message: "Purchase not found" };
        }

        // Adjust material quantity
        await prisma.rawMaterial.update({
            where: { id: purchase.materialId },
            data: {
                quantity: {
                    decrement: purchase.quantity,
                },
            },
        });

        // Delete purchase
        await prisma.rawMaterialPurchase.delete({
            where: { id },
        });

        revalidatePath("/dashboard/marketing/purchases");
        revalidatePath("/dashboard/marketing/raw-materials");
        return { message: "Purchase deleted successfully" };
    } catch (error) {
        console.error("Error deleting purchase:", error);
        return { message: "Failed to delete purchase" };
    }
}

/**
 * Get purchase statistics
 */
export async function getPurchaseStats(startDate?: Date, endDate?: Date) {
    try {
        const where: any = {};

        if (startDate || endDate) {
            where.purchaseDate = {};
            if (startDate) where.purchaseDate.gte = startDate;
            if (endDate) where.purchaseDate.lte = endDate;
        }

        const [
            totalPurchases,
            totalValue,
            totalTransportCost,
            bySeller,
            byMaterial,
        ] = await Promise.all([
            prisma.rawMaterialPurchase.count({ where }),
            prisma.rawMaterialPurchase.aggregate({
                where,
                _sum: {
                    grandTotal: true,
                },
            }),
            prisma.rawMaterialPurchase.aggregate({
                where,
                _sum: {
                    transportationCost: true,
                },
            }),
            prisma.rawMaterialPurchase.groupBy({
                by: ["sellerId"],
                where,
                _sum: {
                    grandTotal: true,
                    quantity: true,
                },
                _count: true,
            }),
            prisma.rawMaterialPurchase.groupBy({
                by: ["materialId"],
                where,
                _sum: {
                    quantity: true,
                    grandTotal: true,
                },
                _count: true,
            }),
        ]);

        return {
            totalPurchases,
            totalValue: totalValue._sum.grandTotal || 0,
            totalTransportCost: totalTransportCost._sum.transportationCost || 0,
            bySeller,
            byMaterial,
        };
    } catch (error) {
        console.error("Error fetching purchase stats:", error);
        return {
            totalPurchases: 0,
            totalValue: 0,
            totalTransportCost: 0,
            bySeller: [],
            byMaterial: [],
        };
    }
}

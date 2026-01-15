"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Get all raw materials
 */
export async function getRawMaterials() {
    try {
        const materials = await prisma.rawMaterial.findMany({
            include: {
                purchases: {
                    orderBy: { purchaseDate: "desc" },
                    take: 1,
                },
                usage: {
                    orderBy: { usedAt: "desc" },
                    take: 5,
                },
            },
            orderBy: { name: "asc" },
        });

        return materials;
    } catch (error) {
        console.error("Error fetching raw materials:", error);
        return [];
    }
}

/**
 * Get raw material by ID
 */
export async function getRawMaterialById(id: string) {
    try {
        const material = await prisma.rawMaterial.findUnique({
            where: { id },
            include: {
                purchases: {
                    include: { seller: true },
                    orderBy: { purchaseDate: "desc" },
                },
                usage: {
                    orderBy: { usedAt: "desc" },
                },
            },
        });

        return material;
    } catch (error) {
        console.error("Error fetching raw material:", error);
        return null;
    }
}

/**
 * Create raw material
 */
export async function createRawMaterial(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const name = formData.get("name") as string;
        const category = formData.get("category") as string;
        const unit = formData.get("unit") as string;
        const quantity = parseFloat(formData.get("quantity") as string) || 0;
        const reorderLevel = formData.get("reorderLevel")
            ? parseFloat(formData.get("reorderLevel") as string)
            : null;
        const currentPrice = formData.get("currentPrice")
            ? parseFloat(formData.get("currentPrice") as string)
            : null;

        if (!name || !category || !unit) {
            return { message: "Name, category, and unit are required" };
        }

        await prisma.rawMaterial.create({
            data: {
                name,
                category,
                unit,
                quantity,
                reorderLevel,
                currentPrice,
            },
        });

        revalidatePath("/dashboard/marketing/raw-materials");
        return { message: "Raw material created successfully" };
    } catch (error) {
        console.error("Error creating raw material:", error);
        return { message: "Failed to create raw material" };
    }
}

/**
 * Update raw material
 */
export async function updateRawMaterial(
    id: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const name = formData.get("name") as string;
        const category = formData.get("category") as string;
        const unit = formData.get("unit") as string;
        const quantity = parseFloat(formData.get("quantity") as string);
        const reorderLevel = formData.get("reorderLevel")
            ? parseFloat(formData.get("reorderLevel") as string)
            : null;
        const currentPrice = formData.get("currentPrice")
            ? parseFloat(formData.get("currentPrice") as string)
            : null;

        if (!name || !category || !unit) {
            return { message: "Name, category, and unit are required" };
        }

        await prisma.rawMaterial.update({
            where: { id },
            data: {
                name,
                category,
                unit,
                quantity,
                reorderLevel,
                currentPrice,
            },
        });

        revalidatePath("/dashboard/marketing/raw-materials");
        revalidatePath(`/dashboard/marketing/raw-materials/${id}`);
        return { message: "Raw material updated successfully" };
    } catch (error) {
        console.error("Error updating raw material:", error);
        return { message: "Failed to update raw material" };
    }
}

/**
 * Delete raw material
 */
export async function deleteRawMaterial(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.rawMaterial.delete({
            where: { id },
        });

        revalidatePath("/dashboard/marketing/raw-materials");
        return { message: "Raw material deleted successfully" };
    } catch (error) {
        console.error("Error deleting raw material:", error);
        return { message: "Failed to delete raw material. It may be in use." };
    }
}

/**
 * Get low stock raw materials
 */
export async function getLowStockRawMaterials() {
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
                ],
            },
            orderBy: { quantity: "asc" },
        });

        return materials;
    } catch (error) {
        console.error("Error fetching low stock materials:", error);
        return [];
    }
}

/**
 * Get raw material statistics
 */
export async function getRawMaterialStats() {
    try {
        const [
            totalMaterials,
            lowStockCount,
            totalValue,
            categoryCounts,
        ] = await Promise.all([
            prisma.rawMaterial.count(),
            prisma.rawMaterial.count({
                where: {
                    AND: [
                        { reorderLevel: { not: null } },
                        {
                            quantity: {
                                lte: prisma.rawMaterial.fields.reorderLevel,
                            },
                        },
                    ],
                },
            }),
            prisma.rawMaterial.aggregate({
                _sum: {
                    quantity: true,
                },
            }),
            prisma.rawMaterial.groupBy({
                by: ["category"],
                _count: true,
            }),
        ]);

        return {
            totalMaterials,
            lowStockCount,
            totalQuantity: totalValue._sum.quantity || 0,
            categoryCounts,
        };
    } catch (error) {
        console.error("Error fetching raw material stats:", error);
        return {
            totalMaterials: 0,
            lowStockCount: 0,
            totalQuantity: 0,
            categoryCounts: [],
        };
    }
}

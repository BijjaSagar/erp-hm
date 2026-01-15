"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Get all sellers
 */
export async function getSellers(includeInactive = false) {
    try {
        const where = includeInactive ? {} : { isActive: true };

        const sellers = await prisma.seller.findMany({
            where,
            include: {
                purchases: {
                    orderBy: { purchaseDate: "desc" },
                    take: 5,
                },
                _count: {
                    select: { purchases: true },
                },
            },
            orderBy: { name: "asc" },
        });

        return sellers;
    } catch (error) {
        console.error("Error fetching sellers:", error);
        return [];
    }
}

/**
 * Get seller by ID
 */
export async function getSellerById(id: string) {
    try {
        const seller = await prisma.seller.findUnique({
            where: { id },
            include: {
                purchases: {
                    include: {
                        material: true,
                    },
                    orderBy: { purchaseDate: "desc" },
                },
            },
        });

        return seller;
    } catch (error) {
        console.error("Error fetching seller:", error);
        return null;
    }
}

/**
 * Create seller
 */
export async function createSeller(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const name = formData.get("name") as string;
        const contact = formData.get("contact") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string;
        const address = formData.get("address") as string;
        const gstNumber = formData.get("gstNumber") as string;

        if (!name) {
            return { message: "Seller name is required" };
        }

        await prisma.seller.create({
            data: {
                name,
                contact: contact || undefined,
                phone: phone || undefined,
                email: email || undefined,
                address: address || undefined,
                gstNumber: gstNumber || undefined,
                isActive: true,
            },
        });

        revalidatePath("/dashboard/marketing/sellers");
        return { message: "Seller created successfully" };
    } catch (error) {
        console.error("Error creating seller:", error);
        return { message: "Failed to create seller" };
    }
}

/**
 * Update seller
 */
export async function updateSeller(
    id: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const name = formData.get("name") as string;
        const contact = formData.get("contact") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string;
        const address = formData.get("address") as string;
        const gstNumber = formData.get("gstNumber") as string;
        const isActive = formData.get("isActive") === "true";

        if (!name) {
            return { message: "Seller name is required" };
        }

        await prisma.seller.update({
            where: { id },
            data: {
                name,
                contact: contact || undefined,
                phone: phone || undefined,
                email: email || undefined,
                address: address || undefined,
                gstNumber: gstNumber || undefined,
                isActive,
            },
        });

        revalidatePath("/dashboard/marketing/sellers");
        revalidatePath(`/dashboard/marketing/sellers/${id}`);
        return { message: "Seller updated successfully" };
    } catch (error) {
        console.error("Error updating seller:", error);
        return { message: "Failed to update seller" };
    }
}

/**
 * Delete seller
 */
export async function deleteSeller(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.seller.delete({
            where: { id },
        });

        revalidatePath("/dashboard/marketing/sellers");
        return { message: "Seller deleted successfully" };
    } catch (error) {
        console.error("Error deleting seller:", error);
        return { message: "Failed to delete seller. They may have purchase records." };
    }
}

/**
 * Toggle seller active status
 */
export async function toggleSellerStatus(id: string, isActive: boolean) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.seller.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/dashboard/marketing/sellers");
        return { message: `Seller ${isActive ? "activated" : "deactivated"} successfully` };
    } catch (error) {
        console.error("Error toggling seller status:", error);
        return { message: "Failed to update seller status" };
    }
}

/**
 * Get seller statistics
 */
export async function getSellerStats() {
    try {
        const [
            totalSellers,
            activeSellers,
            totalPurchases,
            topSellers,
        ] = await Promise.all([
            prisma.seller.count(),
            prisma.seller.count({ where: { isActive: true } }),
            prisma.rawMaterialPurchase.count(),
            prisma.seller.findMany({
                include: {
                    _count: {
                        select: { purchases: true },
                    },
                    purchases: {
                        select: { grandTotal: true },
                    },
                },
                orderBy: {
                    purchases: {
                        _count: "desc",
                    },
                },
                take: 5,
            }),
        ]);

        const topSellersWithTotals = topSellers.map(seller => ({
            ...seller,
            totalPurchaseValue: seller.purchases.reduce(
                (sum, p) => sum + p.grandTotal,
                0
            ),
        }));

        return {
            totalSellers,
            activeSellers,
            totalPurchases,
            topSellers: topSellersWithTotals,
        };
    } catch (error) {
        console.error("Error fetching seller stats:", error);
        return {
            totalSellers: 0,
            activeSellers: 0,
            totalPurchases: 0,
            topSellers: [],
        };
    }
}

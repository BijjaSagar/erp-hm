"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { TransferSourceType, TransferStatus } from "@prisma/client";

// Generate unique transfer number
async function generateTransferNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await prisma.stockTransfer.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `TRF${year}${month}${sequence}`;
}

export async function createStockTransfer(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const fromType = formData.get("fromType") as TransferSourceType;
        const fromBranchId = formData.get("fromBranchId") as string | null;
        const fromStoreId = formData.get("fromStoreId") as string | null;
        const toStoreId = formData.get("toStoreId") as string;
        const orderId = formData.get("orderId") as string | null;
        const notes = formData.get("notes") as string;
        const itemsJson = formData.get("items") as string;
        const items = JSON.parse(itemsJson);

        const transferNumber = await generateTransferNumber();

        await prisma.stockTransfer.create({
            data: {
                transferNumber,
                fromType,
                fromBranchId: fromBranchId || null,
                fromStoreId: fromStoreId || null,
                toStoreId,
                orderId: orderId || null,
                notes,
                transferredBy: session.user.id,
                status: TransferStatus.PENDING,
                items: {
                    create: items,
                },
            },
        });

        revalidatePath("/dashboard/stock-transfer");
        return { message: "Transfer created successfully", transferNumber };
    } catch (error) {
        console.error("Error creating stock transfer:", error);
        return { message: "Failed to create stock transfer" };
    }
}

export async function getStockTransfers(filters?: {
    status?: TransferStatus;
    storeId?: string;
}) {
    const session = await auth();
    if (!session) return [];

    try {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.storeId) {
            where.OR = [
                { toStoreId: filters.storeId },
                { fromStoreId: filters.storeId },
            ];
        }

        const transfers = await prisma.stockTransfer.findMany({
            where,
            include: {
                fromBranch: true,
                fromStore: true,
                toStore: true,
                order: true,
                transferrer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return transfers;
    } catch (error) {
        console.error("Error fetching stock transfers:", error);
        return [];
    }
}

export async function getStockTransferById(id: string) {
    const session = await auth();
    if (!session) return null;

    try {
        const transfer = await prisma.stockTransfer.findUnique({
            where: { id },
            include: {
                fromBranch: true,
                fromStore: true,
                toStore: true,
                order: {
                    include: {
                        items: true,
                    },
                },
                transferrer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: true,
            },
        });

        return transfer;
    } catch (error) {
        console.error("Error fetching stock transfer:", error);
        return null;
    }
}

export async function receiveStockTransfer(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const transfer = await prisma.stockTransfer.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!transfer) {
            return { message: "Transfer not found" };
        }

        if (transfer.status !== TransferStatus.PENDING) {
            return { message: "Transfer already processed" };
        }

        // Update transfer status
        await prisma.stockTransfer.update({
            where: { id },
            data: {
                status: TransferStatus.RECEIVED,
                receivedBy: session.user.id,
                receivedAt: new Date(),
            },
        });

        // Update store inventory
        for (const item of transfer.items) {
            await prisma.storeInventory.upsert({
                where: {
                    storeId_sku: {
                        storeId: transfer.toStoreId,
                        sku: item.sku,
                    },
                },
                update: {
                    quantity: {
                        increment: item.quantity,
                    },
                },
                create: {
                    storeId: transfer.toStoreId,
                    productName: item.productName,
                    sku: item.sku,
                    quantity: item.quantity,
                    unit: item.unit,
                    costPrice: 0, // To be set by store manager
                    sellingPrice: 0, // To be set by store manager
                },
            });
        }

        revalidatePath("/dashboard/stock-transfer");
        revalidatePath(`/dashboard/stock-transfer/${id}`);
        revalidatePath(`/dashboard/stores/${transfer.toStoreId}/inventory`);
        return { message: "Transfer received successfully" };
    } catch (error) {
        console.error("Error receiving stock transfer:", error);
        return { message: "Failed to receive stock transfer" };
    }
}

export async function cancelStockTransfer(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.stockTransfer.update({
            where: { id },
            data: {
                status: TransferStatus.CANCELLED,
            },
        });

        revalidatePath("/dashboard/stock-transfer");
        revalidatePath(`/dashboard/stock-transfer/${id}`);
        return { message: "Transfer cancelled successfully" };
    } catch (error) {
        console.error("Error cancelling stock transfer:", error);
        return { message: "Failed to cancel stock transfer" };
    }
}

export async function transferFromProduction(
    orderId: string,
    storeId: string,
    items: Array<{ productName: string; sku: string; quantity: number; unit: string }>
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return { message: "Order not found" };
        }

        const transferNumber = await generateTransferNumber();

        await prisma.stockTransfer.create({
            data: {
                transferNumber,
                fromType: TransferSourceType.PRODUCTION,
                fromBranchId: order.branchId,
                toStoreId: storeId,
                orderId,
                transferredBy: session.user.id,
                status: TransferStatus.PENDING,
                items: {
                    create: items,
                },
            },
        });

        revalidatePath("/dashboard/stock-transfer");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { message: "Transfer created successfully", transferNumber };
    } catch (error) {
        console.error("Error creating transfer from production:", error);
        return { message: "Failed to create transfer" };
    }
}

// Get completed orders ready for transfer
export async function getCompletedOrdersForTransfer() {
    const session = await auth();
    if (!session || !["ADMIN", "PRODUCTION_SUPERVISOR"].includes(session.user.role)) {
        return [];
    }

    try {
        const completedOrders = await prisma.order.findMany({
            where: {
                status: "COMPLETED"
            },
            include: {
                branch: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                items: true,
                productionEntries: {
                    where: {
                        stage: "COMPLETED",
                        endTime: { not: null }
                    },
                    select: {
                        outputQuantity: true,
                        endTime: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return completedOrders;
    } catch (error) {
        console.error("Failed to get completed orders:", error);
        return [];
    }
}

// Get all active stores for transfer selection
export async function getStoresForTransfer() {
    const session = await auth();
    if (!session) return [];

    try {
        const stores = await prisma.store.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                address: true,
                phone: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return stores;
    } catch (error) {
        console.error("Failed to get stores:", error);
        return [];
    }
}

// Get store inventory
export async function getStoreInventory(storeId: string) {
    const session = await auth();
    if (!session) return [];

    try {
        const inventory = await prisma.storeInventory.findMany({
            where: { storeId },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            },
            orderBy: {
                productName: 'asc'
            }
        });

        return inventory;
    } catch (error) {
        console.error("Failed to get store inventory:", error);
        return [];
    }
}

// Get inventory overview (all stores)
export async function getInventoryOverview() {
    const session = await auth();
    if (!session || !["ADMIN", "PRODUCTION_SUPERVISOR"].includes(session.user.role)) {
        return { inventory: [], stats: { totalProducts: 0, totalQuantity: 0, totalValue: 0, lowStockCount: 0 } };
    }

    try {
        const inventory = await prisma.storeInventory.findMany({
            include: {
                store: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { productName: 'asc' },
                { store: { name: 'asc' } }
            ]
        });

        // Calculate totals
        const totalProducts = new Set(inventory.map(i => i.sku)).size;
        const totalQuantity = inventory.reduce((sum, i) => sum + i.quantity, 0);
        const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
        const lowStockItems = inventory.filter(i => i.reorderLevel && i.quantity <= i.reorderLevel);

        return {
            inventory,
            stats: {
                totalProducts,
                totalQuantity,
                totalValue,
                lowStockCount: lowStockItems.length
            }
        };
    } catch (error) {
        console.error("Failed to get inventory overview:", error);
        return { inventory: [], stats: { totalProducts: 0, totalQuantity: 0, totalValue: 0, lowStockCount: 0 } };
    }
}

// Update transfer status (IN_TRANSIT)
export async function updateTransferStatus(id: string, status: TransferStatus) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.stockTransfer.update({
            where: { id },
            data: { status }
        });

        revalidatePath("/dashboard/stock-transfer");
        revalidatePath(`/dashboard/stock-transfer/${id}`);
        return { message: "Status updated successfully" };
    } catch (error) {
        console.error("Error updating transfer status:", error);
        return { message: "Failed to update status" };
    }
}


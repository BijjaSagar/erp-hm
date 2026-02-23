"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { OrderStatus, ProductionStage } from "@prisma/client";

/**
 * Approve an order
 */
export async function approveOrder(orderId: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.APPROVED,
            },
        });

        // Add a log for approval
        await prisma.productionLog.create({
            data: {
                orderId: orderId,
                stage: ProductionStage.PENDING,
                status: "APPROVED",
                notes: `Order approved by ${session.user.name}`,
            },
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        revalidatePath("/dashboard/production");

        return { success: true, message: "Order approved successfully" };
    } catch (error) {
        console.error("Error approving order:", error);
        return { error: "Failed to approve order" };
    }
}

/**
 * Allocate material to an order
 */
export async function allocateMaterial(data: {
    orderId: string;
    materialId: string;
    quantity: number;
    unit: string;
    notes?: string;
}) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create allocation record
            const allocation = await tx.materialAllocation.create({
                data: {
                    orderId: data.orderId,
                    materialId: data.materialId,
                    quantity: data.quantity,
                    unit: data.unit,
                    allocatedBy: session.user.id!,
                    notes: data.notes,
                },
            });

            // Note: We don't necessarily deduct from InventoryItem yet, 
            // as "providing" might just mean allocating for this order.
            // But usually, "providing" means it's gone from general stock.
            // The requirement says "If a manager provides 100 kg...".

            await tx.inventoryItem.update({
                where: { id: data.materialId },
                data: {
                    quantity: {
                        decrement: data.quantity
                    }
                }
            });

            // Log stock transaction
            await tx.stockTransaction.create({
                data: {
                    itemId: data.materialId,
                    quantity: data.quantity,
                    type: 'OUT',
                    userId: session.user.id!,
                }
            });

            return allocation;
        });

        revalidatePath(`/dashboard/orders/${data.orderId}`);
        revalidatePath("/dashboard/raw-materials");

        return { success: true, allocation: result };
    } catch (error) {
        console.error("Error allocating material:", error);
        return { error: "Failed to allocate material" };
    }
}

/**
 * Get allocations for an order
 */
export async function getOrderAllocations(orderId: string) {
    try {
        const allocations = await prisma.materialAllocation.findMany({
            where: { orderId },
            include: {
                material: true,
            },
            orderBy: {
                allocatedAt: "desc",
            },
        });

        return allocations;
    } catch (error) {
        console.error("Error fetching order allocations:", error);
        return [];
    }
}

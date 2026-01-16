"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Approve order (Marketing Head)
 */
export async function approveOrder(orderId: string) {
    const session = await auth();
    if (!session || session.user.role !== "MARKETING_HEAD") {
        return { message: "Unauthorized. Only Marketing Head can approve orders." };
    }

    try {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "APPROVED",
            },
        });

        revalidatePath("/dashboard/marketing/orders");
        revalidatePath("/dashboard/orders");
        return { message: "Order approved successfully" };
    } catch (error) {
        console.error("Error approving order:", error);
        return { message: "Failed to approve order" };
    }
}

/**
 * Reject order (Marketing Head)
 */
export async function rejectOrder(orderId: string, reason?: string) {
    const session = await auth();
    if (!session || session.user.role !== "MARKETING_HEAD") {
        return { message: "Unauthorized. Only Marketing Head can reject orders." };
    }

    try {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "CANCELLED",
            },
        });

        revalidatePath("/dashboard/marketing/orders");
        revalidatePath("/dashboard/orders");
        return { message: "Order rejected successfully" };
    } catch (error) {
        console.error("Error rejecting order:", error);
        return { message: "Failed to reject order" };
    }
}

/**
 * Get pending orders for Marketing Head approval
 */
export async function getPendingOrders() {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: "PENDING",
            },
            include: {
                items: true,
                branch: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return orders;
    } catch (error) {
        console.error("Error fetching pending orders:", error);
        return [];
    }
}

/**
 * Get all orders for Marketing Head
 */
export async function getMarketingOrders(status?: string) {
    try {
        const where: any = {};
        if (status && status !== "ALL") {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: true,
                branch: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return orders;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

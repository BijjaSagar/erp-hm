"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";
import { OrderStatus, ProductionStage } from "@prisma/client";

// Schema for order creation
const orderSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),
    branchId: z.string().optional(),
    items: z.array(z.object({
        productName: z.string().min(1, "Product name is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        dimensions: z.string().optional(),
        material: z.string().optional(),
    })).min(1, "At least one item is required"),
});

// Generate unique order number
async function generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    // Get count of orders today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await prisma.order.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${sequence}`;
}

export async function createOrder(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const customerName = formData.get("customerName") as string;
        const customerPhone = formData.get("customerPhone") as string;
        const customerAddress = formData.get("customerAddress") as string;
        const branchId = formData.get("branchId") as string;

        // Parse items from formData
        const itemsJson = formData.get("items") as string;
        const items = JSON.parse(itemsJson);

        // Validate
        const validated = orderSchema.parse({
            customerName,
            customerPhone,
            customerAddress,
            branchId: branchId && branchId !== "none" ? branchId : undefined,
            items,
        });

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Create order with items
        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerName: validated.customerName,
                customerPhone: validated.customerPhone,
                customerAddress: validated.customerAddress,
                branchId: validated.branchId || null,
                status: OrderStatus.PENDING,
                currentStage: ProductionStage.PENDING,
                items: {
                    create: validated.items,
                },
            },
            include: {
                items: true,
            },
        });

        revalidatePath("/dashboard/orders");
        return {
            message: "Order created successfully",
            orderId: order.id,
            orderNumber: order.orderNumber
        };
    } catch (error) {
        console.error("Error creating order:", error);
        if (error instanceof z.ZodError) {
            return { message: error.issues[0].message };
        }
        return { message: "Failed to create order" };
    }
}

export async function getOrders(filters?: {
    status?: OrderStatus;
    stage?: ProductionStage;
    search?: string;
}) {
    try {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.stage) {
            where.currentStage = filters.stage;
        }

        if (filters?.search) {
            where.OR = [
                { orderNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                branch: true,
                items: true,
                _count: {
                    select: {
                        items: true,
                        productionLogs: true,
                    },
                },
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

export async function getOrderById(id: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                branch: true,
                items: true,
                productionLogs: {
                    include: {
                        employee: true,
                    },
                    orderBy: {
                        timestamp: "desc",
                    },
                },
                invoices: true,
            },
        });

        return order;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}

export async function updateOrder(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const customerName = formData.get("customerName") as string;
        const customerPhone = formData.get("customerPhone") as string;
        const customerAddress = formData.get("customerAddress") as string;
        const status = formData.get("status") as OrderStatus;
        const branchId = formData.get("branchId") as string;

        await prisma.order.update({
            where: { id },
            data: {
                customerName,
                customerPhone,
                customerAddress,
                status,
                branchId: branchId && branchId !== "none" ? branchId : null,
            },
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${id}`);
        return { message: "Order updated successfully" };
    } catch (error) {
        console.error("Error updating order:", error);
        return { message: "Failed to update order" };
    }
}

export async function deleteOrder(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        // Delete related records first
        await prisma.orderItem.deleteMany({
            where: { orderId: id },
        });

        await prisma.productionLog.deleteMany({
            where: { orderId: id },
        });

        await prisma.invoice.deleteMany({
            where: { orderId: id },
        });

        // Delete the order
        await prisma.order.delete({
            where: { id },
        });

        revalidatePath("/dashboard/orders");
        return { message: "Order deleted successfully" };
    } catch (error) {
        console.error("Error deleting order:", error);
        return { message: "Failed to delete order" };
    }
}

export async function updateOrderStage(id: string, stage: ProductionStage) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.order.update({
            where: { id },
            data: {
                currentStage: stage,
                status: stage === ProductionStage.COMPLETED
                    ? OrderStatus.COMPLETED
                    : OrderStatus.IN_PRODUCTION,
            },
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${id}`);
        revalidatePath("/dashboard/production");
        return { message: "Order stage updated successfully" };
    } catch (error) {
        console.error("Error updating order stage:", error);
        return { message: "Failed to update order stage" };
    }
}

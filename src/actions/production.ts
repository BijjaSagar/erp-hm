"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ProductionStage, OrderStatus } from "@prisma/client";

export async function createProductionLog(
    orderId: string,
    stage: ProductionStage,
    employeeId: string | null,
    notes: string | null,
    status: string
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.productionLog.create({
            data: {
                orderId,
                stage,
                status,
                employeeId: employeeId || undefined,
                notes: notes || undefined,
            },
        });

        revalidatePath("/dashboard/production");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { message: "Production log created successfully" };
    } catch (error) {
        console.error("Error creating production log:", error);
        return { message: "Failed to create production log" };
    }
}

export async function getProductionLogsByOrder(orderId: string) {
    try {
        const logs = await prisma.productionLog.findMany({
            where: { orderId },
            include: {
                employee: true,
            },
            orderBy: {
                timestamp: "desc",
            },
        });

        return logs;
    } catch (error) {
        console.error("Error fetching production logs:", error);
        return [];
    }
}

export async function getOrdersByStage(stage?: ProductionStage) {
    try {
        const where: any = {};

        if (stage) {
            where.currentStage = stage;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                branch: true,
                items: true,
                _count: {
                    select: {
                        items: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return orders;
    } catch (error) {
        console.error("Error fetching orders by stage:", error);
        return [];
    }
}

export async function updateProductionStage(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const orderId = formData.get("orderId") as string;
        const stage = formData.get("stage") as ProductionStage;
        const employeeId = formData.get("employeeId") as string;
        const notes = formData.get("notes") as string;
        const status = formData.get("status") as string;

        if (!orderId || !stage) {
            return { message: "Order ID and stage are required" };
        }

        // Get current order to validate stage progression
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { currentStage: true },
        });

        if (!order) {
            return { message: "Order not found" };
        }

        // Validate stage progression
        const stages = Object.values(ProductionStage);
        const currentStageIndex = stages.indexOf(order.currentStage);
        const newStageIndex = stages.indexOf(stage);

        if (newStageIndex < currentStageIndex) {
            return { message: "Cannot move to a previous stage" };
        }

        if (newStageIndex - currentStageIndex > 1) {
            return { message: "Cannot skip stages. Please update to the next stage in sequence." };
        }

        // Update order stage
        await prisma.order.update({
            where: { id: orderId },
            data: {
                currentStage: stage,
                status: stage === ProductionStage.COMPLETED
                    ? OrderStatus.COMPLETED
                    : OrderStatus.IN_PRODUCTION,
            },
        });

        // Create production log
        await prisma.productionLog.create({
            data: {
                orderId,
                stage,
                status: status || "Completed",
                employeeId: employeeId || undefined,
                notes: notes || undefined,
            },
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);

        return { message: "Production stage updated successfully" };
    } catch (error) {
        console.error("Error updating production stage:", error);
        return { message: "Failed to update production stage" };
    }
}

export async function getProductionStats() {
    try {
        const stages = Object.values(ProductionStage);
        const stats: Record<string, number> = {};

        for (const stage of stages) {
            // Define status filter based on stage
            let statusFilter;

            if (stage === ProductionStage.PENDING) {
                // PENDING stage can have PENDING or APPROVED status
                statusFilter = { in: [OrderStatus.PENDING, OrderStatus.APPROVED] };
            } else if (stage === ProductionStage.COMPLETED) {
                // COMPLETED stage should have COMPLETED status
                statusFilter = { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] };
            } else {
                // All other stages should be IN_PRODUCTION or APPROVED
                statusFilter = { in: [OrderStatus.APPROVED, OrderStatus.IN_PRODUCTION] };
            }

            const count = await prisma.order.count({
                where: {
                    currentStage: stage,
                    status: statusFilter,
                },
            });
            stats[stage] = count;
        }

        return stats;
    } catch (error) {
        console.error("Error fetching production stats:", error);
        return {};
    }
}

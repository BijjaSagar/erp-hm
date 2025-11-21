'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ProductionStage } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface WastageData {
    orderId?: string;
    materialName: string;
    quantity: number;
    unit: string;
    reason: string;
    stage: ProductionStage;
    photoUrl?: string;
}

export async function logWastage(data: WastageData) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const wastageLog = await prisma.wastageLog.create({
            data: {
                employeeId: session.user.employeeId,
                ...data
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true, wastageLog };
    } catch (error) {
        console.error("Failed to log wastage:", error);
        return { error: "Failed to log wastage" };
    }
}

export async function getWastageLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    stage?: ProductionStage;
}) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const wastageLogs = await prisma.wastageLog.findMany({
            where: {
                employeeId: session.user.employeeId,
                ...(filters?.startDate && filters?.endDate ? {
                    timestamp: {
                        gte: filters.startDate,
                        lte: filters.endDate
                    }
                } : {}),
                ...(filters?.stage ? { stage: filters.stage } : {})
            },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        customerName: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        return { wastageLogs };
    } catch (error) {
        console.error("Failed to get wastage logs:", error);
        return { error: "Failed to get wastage logs" };
    }
}

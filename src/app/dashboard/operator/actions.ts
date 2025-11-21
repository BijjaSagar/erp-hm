'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ProductionStage } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAssignedOrders() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    // Fetch employee details to get assigned stages
    const employee = await prisma.employee.findUnique({
        where: { id: session.user.employeeId },
        select: { assignedStages: true }
    });

    const assignedStages = employee?.assignedStages || [];

    // Build where clause
    const where: any = {
        status: {
            in: ["APPROVED", "IN_PRODUCTION"],
        },
    };

    // If employee has specific assigned stages, filter by them
    if (assignedStages.length > 0) {
        where.currentStage = {
            in: assignedStages
        };
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            items: true,
            productionLogs: {
                orderBy: {
                    timestamp: 'desc'
                },
                take: 1
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return { orders };
}

export async function updateOrderStage(orderId: string, stage: ProductionStage, notes?: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        // 1. Create a production log
        await prisma.productionLog.create({
            data: {
                orderId,
                stage,
                status: "COMPLETED", // The stage is completed/done
                employeeId: session.user.employeeId,
                notes,
            }
        });

        // 2. Update the order's current stage
        await prisma.order.update({
            where: { id: orderId },
            data: {
                currentStage: stage,
                status: stage === 'COMPLETED' ? 'COMPLETED' : 'IN_PRODUCTION'
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true };
    } catch (error) {
        console.error("Failed to update order stage:", error);
        return { error: "Failed to update order stage" };
    }
}

export async function getOperatorStats() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get order counts
        const [pendingOrders, ongoingOrders, completedOrders] = await Promise.all([
            prisma.order.count({
                where: { status: 'APPROVED' }
            }),
            prisma.order.count({
                where: { status: 'IN_PRODUCTION' }
            }),
            prisma.order.count({
                where: {
                    status: 'COMPLETED',
                    updatedAt: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            })
        ]);

        // Get today's attendance
        const attendance = await prisma.attendance.findFirst({
            where: {
                employeeId: session.user.employeeId,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // Calculate hours worked
        let hoursWorked = 0;
        let checkInTime = '';
        if (attendance) {
            const now = attendance.checkOut || new Date();
            hoursWorked = (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
            checkInTime = attendance.checkIn.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Get today's breaks
        const breaks = await prisma.break.findMany({
            where: {
                employeeId: session.user.employeeId,
                startTime: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        const breakMinutes = breaks
            .filter(b => b.duration)
            .reduce((sum, b) => sum + (b.duration || 0), 0);

        // Get pending leave requests
        const pendingLeaves = await prisma.leaveRequest.count({
            where: {
                employeeId: session.user.employeeId,
                status: 'PENDING'
            }
        });

        return {
            stats: {
                pendingOrders,
                ongoingOrders,
                completedOrders,
                checkedIn: !!attendance,
                checkInTime,
                hoursWorked,
                breaksToday: breaks.length,
                breakMinutes,
                pendingLeaves
            }
        };
    } catch (error) {
        console.error("Failed to get operator stats:", error);
        return { error: "Failed to get operator stats" };
    }
}

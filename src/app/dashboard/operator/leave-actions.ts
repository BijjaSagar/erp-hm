'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { LeaveType } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface LeaveRequestData {
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
}

export async function createLeaveRequest(data: LeaveRequestData) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: session.user.employeeId,
                ...data
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true, leaveRequest };
    } catch (error) {
        console.error("Failed to create leave request:", error);
        return { error: "Failed to create leave request" };
    }
}

export async function getLeaveRequests() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                employeeId: session.user.employeeId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { leaveRequests };
    } catch (error) {
        console.error("Failed to get leave requests:", error);
        return { error: "Failed to get leave requests" };
    }
}

export async function cancelLeaveRequest(id: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leaveRequest || leaveRequest.employeeId !== session.user.employeeId) {
            return { error: "Leave request not found" };
        }

        if (leaveRequest.status !== 'PENDING') {
            return { error: "Can only cancel pending requests" };
        }

        await prisma.leaveRequest.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        revalidatePath('/dashboard/operator');
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel leave request:", error);
        return { error: "Failed to cancel leave request" };
    }
}

export async function getLeaveBalance() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);

        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: session.user.employeeId,
                status: 'APPROVED',
                startDate: {
                    gte: yearStart,
                    lte: yearEnd
                }
            }
        });

        // Calculate days taken by leave type
        const leaveDays = approvedLeaves.reduce((acc, leave) => {
            const days = Math.ceil(
                (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

            acc[leave.leaveType] = (acc[leave.leaveType] || 0) + days;
            return acc;
        }, {} as Record<string, number>);

        // Default quotas (can be made configurable)
        const quotas = {
            CASUAL: 12,
            SICK: 10,
            EARNED: 15,
            UNPAID: 999
        };

        const balance = {
            CASUAL: quotas.CASUAL - (leaveDays.CASUAL || 0),
            SICK: quotas.SICK - (leaveDays.SICK || 0),
            EARNED: quotas.EARNED - (leaveDays.EARNED || 0),
            UNPAID: quotas.UNPAID
        };

        return { balance, taken: leaveDays };
    } catch (error) {
        console.error("Failed to get leave balance:", error);
        return { error: "Failed to get leave balance" };
    }
}

'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function startBreak(reason?: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        // Check if there's already an active break
        const activeBreak = await prisma.break.findFirst({
            where: {
                employeeId: session.user.employeeId,
                endTime: null
            }
        });

        if (activeBreak) {
            return { error: "You already have an active break" };
        }

        const breakRecord = await prisma.break.create({
            data: {
                employeeId: session.user.employeeId,
                reason
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true, break: breakRecord };
    } catch (error) {
        console.error("Failed to start break:", error);
        return { error: "Failed to start break" };
    }
}

export async function endBreak(breakId: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const breakRecord = await prisma.break.findUnique({
            where: { id: breakId }
        });

        if (!breakRecord || breakRecord.employeeId !== session.user.employeeId) {
            return { error: "Break not found" };
        }

        if (breakRecord.endTime) {
            return { error: "Break already ended" };
        }

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - breakRecord.startTime.getTime()) / 60000); // minutes

        const updatedBreak = await prisma.break.update({
            where: { id: breakId },
            data: {
                endTime,
                duration
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true, break: updatedBreak };
    } catch (error) {
        console.error("Failed to end break:", error);
        return { error: "Failed to end break" };
    }
}

export async function getActiveBreak() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const activeBreak = await prisma.break.findFirst({
            where: {
                employeeId: session.user.employeeId,
                endTime: null
            }
        });

        return { break: activeBreak };
    } catch (error) {
        console.error("Failed to get active break:", error);
        return { error: "Failed to get active break" };
    }
}

export async function getBreakHistory(startDate?: Date, endDate?: Date) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const breaks = await prisma.break.findMany({
            where: {
                employeeId: session.user.employeeId,
                ...(startDate && endDate ? {
                    startTime: {
                        gte: startDate,
                        lte: endDate
                    }
                } : {})
            },
            orderBy: {
                startTime: 'desc'
            }
        });

        const totalBreakTime = breaks
            .filter(b => b.duration)
            .reduce((sum, b) => sum + (b.duration || 0), 0);

        return { breaks, totalBreakTime };
    } catch (error) {
        console.error("Failed to get break history:", error);
        return { error: "Failed to get break history" };
    }
}

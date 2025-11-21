'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getAttendanceHistory(days: number = 30) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId: session.user.employeeId,
                date: {
                    gte: startDate
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        return { attendance };
    } catch (error) {
        console.error("Failed to fetch attendance history:", error);
        return { error: "Failed to fetch attendance history" };
    }
}

export async function getAttendanceStats() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId: session.user.employeeId,
                date: {
                    gte: currentMonth
                }
            }
        });

        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
        const lateDays = attendance.filter(a => {
            if (!a.checkIn) return false;
            const checkInTime = new Date(a.checkIn);
            const hours = checkInTime.getHours();
            const minutes = checkInTime.getMinutes();
            // Assuming work starts at 9:00 AM
            return hours > 9 || (hours === 9 && minutes > 15);
        }).length;

        // Calculate average working hours
        const completedDays = attendance.filter(a => a.checkOut);
        const totalMinutes = completedDays.reduce((sum, a) => {
            if (!a.checkOut) return sum;
            const diff = new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime();
            return sum + (diff / 60000); // Convert to minutes
        }, 0);
        const avgHours = completedDays.length > 0 ? totalMinutes / completedDays.length / 60 : 0;

        return {
            stats: {
                totalDays,
                presentDays,
                lateDays,
                avgHours: avgHours.toFixed(1)
            }
        };
    } catch (error) {
        console.error("Failed to fetch attendance stats:", error);
        return { error: "Failed to fetch attendance stats" };
    }
}

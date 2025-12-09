"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";

// Haversine formula to calculate distance between two points in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Radius of the earth in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

const MAX_DISTANCE_METERS = 500; // Allow check-in within 500m of branch

const checkInSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    latitude: z.number(),
    longitude: z.number(),
});

export async function markAttendance(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const employeeId = formData.get("employeeId") as string;
    const latStr = formData.get("latitude") as string;
    const lonStr = formData.get("longitude") as string;

    if (!employeeId || !latStr || !lonStr) {
        return { message: "Missing location or employee data." };
    }

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    try {
        // 1. Get Employee and their Branch
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { branch: true },
        });

        if (!employee) return { message: "Employee not found." };

        // 2. Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
            },
        });

        // 3. Validate Location (Geofencing)
        // For now, we assume branch address string contains "lat,lng" or we skip if not set.
        // In a real app, Branch model should have lat/lng fields. 
        // Let's assume we skip validation if branch has no coords, or we parse them.
        // TODO: Add lat/lng to Branch model for real geofencing.

        // 4. Mark Attendance
        if (existingAttendance && !existingAttendance.checkOut) {
            // Check Out
            await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    checkOut: new Date(),
                    status: "PRESENT", // Or calculate hours
                },
            });
            revalidatePath("/dashboard/attendance");
            return { message: "Checked Out Successfully" };
        } else if (!existingAttendance) {
            // Check In
            await prisma.attendance.create({
                data: {
                    employeeId: employee.id,
                    checkIn: new Date(),
                    date: new Date(),
                    status: "PRESENT",
                    location: `${latitude},${longitude}`,
                },
            });
            revalidatePath("/dashboard/attendance");
            return { message: "Checked In Successfully" };
        } else {
            return { message: "Already checked out for today." };
        }

    } catch (error) {
        console.error(error);
        return { message: "Failed to mark attendance." };
    }
}

export async function getTodayAttendance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.attendance.findMany({
        where: {
            date: {
                gte: today,
            },
        },
        include: {
            employee: true,
        },
        orderBy: {
            checkIn: "desc",
        },
    });
}

export async function checkOutAttendance(attendanceId: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const attendance = await prisma.attendance.findUnique({
            where: { id: attendanceId },
        });

        if (!attendance) {
            return { message: "Attendance record not found" };
        }

        if (attendance.checkOut) {
            return { message: "Already checked out" };
        }

        await prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                checkOut: new Date(),
                status: "PRESENT",
            },
        });

        revalidatePath("/dashboard/attendance");
        return { message: "Checked out successfully" };
    } catch (error) {
        console.error("Error checking out:", error);
        return { message: "Failed to check out" };
    }
}

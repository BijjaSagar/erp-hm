"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@prisma/client";

export async function getUsers(filters?: { role?: string }) {
    const session = await auth();
    if (!session) return [];

    try {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role as Role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branchId: true,
                branch: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function getUserById(id: string) {
    const session = await auth();
    if (!session) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branchId: true,
                employeeId: true,
                branch: true,
                employee: true,
            },
        });

        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

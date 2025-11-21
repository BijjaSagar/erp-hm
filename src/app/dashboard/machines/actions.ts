'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Machine, ProductionStage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { machineSchema, MachineData } from "./schema";

export type { MachineData };

export async function getMachines(branchId?: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const machines = await prisma.machine.findMany({
            where: branchId ? { branchId } : {},
            include: {
                branch: {
                    select: {
                        name: true
                    }
                },
                machineStatuses: {
                    orderBy: {
                        reportedAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return { machines };
    } catch (error) {
        console.error("Failed to fetch machines:", error);
        return { error: "Failed to fetch machines" };
    }
}

export async function createMachine(data: MachineData) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    const validated = machineSchema.safeParse(data);
    if (!validated.success) {
        return { error: validated.error.issues[0].message };
    }

    try {
        const machine = await prisma.machine.create({
            data: validated.data
        });

        revalidatePath('/dashboard/machines');
        return { success: true, machine };
    } catch (error) {
        console.error("Failed to create machine:", error);
        return { error: "Failed to create machine. Code might be duplicate." };
    }
}

export async function updateMachine(id: string, data: Partial<MachineData>) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const machine = await prisma.machine.update({
            where: { id },
            data
        });

        revalidatePath('/dashboard/machines');
        return { success: true, machine };
    } catch (error) {
        console.error("Failed to update machine:", error);
        return { error: "Failed to update machine" };
    }
}

export async function deleteMachine(id: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.machine.delete({
            where: { id }
        });

        revalidatePath('/dashboard/machines');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete machine:", error);
        return { error: "Failed to delete machine" };
    }
}

export async function getMachineById(id: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const machine = await prisma.machine.findUnique({
            where: { id },
            include: {
                branch: true
            }
        });

        return { machine };
    } catch (error) {
        console.error("Failed to fetch machine:", error);
        return { error: "Failed to fetch machine" };
    }
}

export async function getBranches() {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const branches = await prisma.branch.findMany({
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                name: true,
                code: true
            }
        });

        return { branches };
    } catch (error) {
        console.error("Failed to fetch branches:", error);
        return { error: "Failed to fetch branches" };
    }
}

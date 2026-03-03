"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { StoreTaskType, StoreTaskStatus } from "@prisma/client";

// ─── CREATE A STORE PRODUCTION TASK ────────────────────────────────────────────
export async function createStoreTask(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const storeId = formData.get("storeId") as string;
        const taskType = formData.get("taskType") as StoreTaskType;
        const description = formData.get("description") as string;
        const assignedTo = formData.get("assignedTo") as string;
        const orderId = formData.get("orderId") as string;

        if (!storeId || !taskType) return { message: "Store and task type are required" };

        await prisma.storeProductionTask.create({
            data: {
                storeId,
                taskType,
                description: description || null,
                assignedTo: assignedTo || null,
                orderId: orderId || null,
                createdBy: session.user.id,
                status: "PENDING",
            },
        });

        revalidatePath(`/dashboard/stores/${storeId}/tasks`);
        return { message: "Task created successfully" };
    } catch (error) {
        console.error("Error creating store task:", error);
        return { message: "Failed to create task" };
    }
}

// ─── UPDATE TASK STATUS ─────────────────────────────────────────────────────────
export async function updateTaskStatus(taskId: string, status: StoreTaskStatus, notes?: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const data: any = { status, notes: notes || undefined };
        if (status === "IN_PROGRESS") data.startedAt = new Date();
        if (status === "COMPLETED") data.completedAt = new Date();

        await prisma.storeProductionTask.update({ where: { id: taskId }, data });

        revalidatePath("/dashboard/stores");
        return { message: "Task updated successfully" };
    } catch (error) {
        console.error("Error updating task:", error);
        return { message: "Failed to update task" };
    }
}

// ─── ASSIGN TASK TO EMPLOYEE ────────────────────────────────────────────────────
export async function assignTask(taskId: string, employeeId: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };
    try {
        await prisma.storeProductionTask.update({
            where: { id: taskId },
            data: { assignedTo: employeeId },
        });
        revalidatePath("/dashboard/stores");
        return { message: "Task assigned successfully" };
    } catch {
        return { message: "Failed to assign task" };
    }
}

// ─── GET TASKS FOR A STORE ──────────────────────────────────────────────────────
export async function getStoreTasksByStore(storeId: string) {
    const session = await auth();
    if (!session) return [];
    try {
        return await prisma.storeProductionTask.findMany({
            where: { storeId },
            include: {
                assignee: { select: { id: true, name: true, designation: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch {
        return [];
    }
}

// ─── GET ALL STORE TASKS ─────────────────────────────────────────────────────────
export async function getAllStoreTasks() {
    const session = await auth();
    if (!session) return [];
    try {
        return await prisma.storeProductionTask.findMany({
            include: {
                store: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch {
        return [];
    }
}

// ─── DELETE TASK ─────────────────────────────────────────────────────────────────
export async function deleteStoreTask(taskId: string, storeId: string) {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER", "STORE_MANAGER"].includes(session.user.role)) {
        return { message: "Unauthorized" };
    }
    try {
        await prisma.storeProductionTask.delete({ where: { id: taskId } });
        revalidatePath(`/dashboard/stores/${storeId}/tasks`);
        return { message: "Task deleted" };
    } catch {
        return { message: "Failed to delete task" };
    }
}

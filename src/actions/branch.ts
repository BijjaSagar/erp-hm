"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

const branchSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    address: z.string().min(1, "Address is required"),
});

export async function getBranches() {
    const session = await auth();
    if (!session) return []; // Or throw error

    return await prisma.branch.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function createBranch(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    const validatedFields = branchSchema.safeParse({
        name: formData.get("name"),
        code: formData.get("code"),
        address: formData.get("address"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Branch.",
        };
    }

    const { name, code, address } = validatedFields.data;

    try {
        await prisma.branch.create({
            data: {
                name,
                code,
                address,
            },
        });
    } catch (error) {
        return { message: "Database Error: Failed to Create Branch." };
    }

    revalidatePath("/dashboard/branches");
    return { message: "Success" }; // In a real app, we might redirect
}

export async function deleteBranch(id: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.branch.delete({
            where: { id },
        });
        revalidatePath("/dashboard/branches");
    } catch (error) {
        throw new Error("Failed to delete branch");
    }
}

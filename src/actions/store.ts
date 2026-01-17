"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

const storeSchema = z.object({
    name: z.string().min(1, "Store name is required"),
    code: z.string().min(1, "Store code is required"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    gstNumber: z.string().optional(),
    managerId: z.string().optional(),
});

export async function getStores() {
    const session = await auth();
    if (!session) return [];

    try {
        const stores = await prisma.store.findMany({
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        inventory: true,
                        posTransactions: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return stores;
    } catch (error) {
        console.error("Error fetching stores:", error);
        return [];
    }
}

export async function getStoreById(id: string) {
    const session = await auth();
    if (!session) return null;

    try {
        const store = await prisma.store.findUnique({
            where: { id },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                inventory: true,
                _count: {
                    select: {
                        posTransactions: true,
                        stockTransfersTo: true,
                    },
                },
            },
        });
        return store;
    } catch (error) {
        console.error("Error fetching store:", error);
        return null;
    }
}

export async function createStore(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BRANCH_MANAGER")) {
        return { message: "Unauthorized" };
    }

    const validatedFields = storeSchema.safeParse({
        name: formData.get("name"),
        code: formData.get("code"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        gstNumber: formData.get("gstNumber"),
        managerId: (() => { const val = formData.get("managerId") as string; return val && val !== "none" ? val : undefined; })(),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Store.",
        };
    }

    const { name, code, address, phone, email, gstNumber, managerId } = validatedFields.data;

    try {
        await prisma.store.create({
            data: {
                name,
                code,
                address,
                phone,
                email: email || null,
                gstNumber,
                managerId: managerId && managerId !== "none" ? managerId : null,
            },
        });
    } catch (error) {
        console.error("Error creating store:", error);
        return { message: "Database Error: Failed to Create Store." };
    }

    revalidatePath("/dashboard/stores");
    return { message: "Success" };
}

export async function updateStore(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BRANCH_MANAGER")) {
        return { message: "Unauthorized" };
    }

    const validatedFields = storeSchema.safeParse({
        name: formData.get("name"),
        code: formData.get("code"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        gstNumber: formData.get("gstNumber"),
        managerId: (() => { const val = formData.get("managerId") as string; return val && val !== "none" ? val : undefined; })(),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Store.",
        };
    }

    const { name, code, address, phone, email, gstNumber, managerId } = validatedFields.data;
    const isActive = formData.get("isActive") === "true";

    try {
        await prisma.store.update({
            where: { id },
            data: {
                name,
                code,
                address,
                phone,
                email: email || null,
                gstNumber,
                managerId: managerId && managerId !== "none" ? managerId : null,
                isActive,
            },
        });
    } catch (error) {
        console.error("Error updating store:", error);
        return { message: "Database Error: Failed to Update Store." };
    }

    revalidatePath("/dashboard/stores");
    revalidatePath(`/dashboard/stores/${id}`);
    return { message: "Store updated successfully" };
}

export async function deleteStore(id: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.store.delete({
            where: { id },
        });
        revalidatePath("/dashboard/stores");
    } catch (error) {
        console.error("Error deleting store:", error);
        throw new Error("Failed to delete store");
    }
}

export async function getStoreInventory(storeId: string) {
    const session = await auth();
    if (!session) return [];

    try {
        const inventory = await prisma.storeInventory.findMany({
            where: { storeId },
            orderBy: { productName: "asc" },
        });
        return inventory;
    } catch (error) {
        console.error("Error fetching store inventory:", error);
        return [];
    }
}

export async function updateStoreInventoryPrice(
    storeId: string,
    sku: string,
    costPrice: number,
    sellingPrice: number
) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STORE_MANAGER")) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.storeInventory.update({
            where: {
                storeId_sku: {
                    storeId,
                    sku,
                },
            },
            data: {
                costPrice,
                sellingPrice,
            },
        });
        revalidatePath(`/dashboard/stores/${storeId}/inventory`);
    } catch (error) {
        console.error("Error updating inventory price:", error);
        throw new Error("Failed to update inventory price");
    }
}

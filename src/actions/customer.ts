"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { CustomerType } from "@prisma/client";

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
    customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
});

export async function getCustomers() {
    const session = await auth();
    if (!session) return [];

    try {
        const customers = await prisma.customer.findMany({
            include: {
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return customers;
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
}

export async function getCustomerById(id: string) {
    const session = await auth();
    if (!session) return null;

    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                transactions: {
                    include: {
                        store: true,
                        items: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
            },
        });
        return customer;
    } catch (error) {
        console.error("Error fetching customer:", error);
        return null;
    }
}

export async function createCustomer(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const validatedFields = customerSchema.safeParse({
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        gstNumber: formData.get("gstNumber"),
        customerType: formData.get("customerType") || CustomerType.RETAIL,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Customer.",
        };
    }

    const { name, phone, email, address, gstNumber, customerType } = validatedFields.data;

    try {
        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                email: email || null,
                address,
                gstNumber,
                customerType,
            },
        });

        revalidatePath("/dashboard/customers");
        return { message: "Success", customerId: customer.id };
    } catch (error) {
        console.error("Error creating customer:", error);
        return { message: "Database Error: Failed to Create Customer." };
    }
}

export async function updateCustomer(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const validatedFields = customerSchema.safeParse({
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        gstNumber: formData.get("gstNumber"),
        customerType: formData.get("customerType") || CustomerType.RETAIL,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Customer.",
        };
    }

    const { name, phone, email, address, gstNumber, customerType } = validatedFields.data;

    try {
        await prisma.customer.update({
            where: { id },
            data: {
                name,
                phone,
                email: email || null,
                address,
                gstNumber,
                customerType,
            },
        });

        revalidatePath("/dashboard/customers");
        revalidatePath(`/dashboard/customers/${id}`);
        return { message: "Success" };
    } catch (error) {
        console.error("Error updating customer:", error);
        return { message: "Database Error: Failed to Update Customer." };
    }
}

export async function searchCustomers(query: string) {
    const session = await auth();
    if (!session) return [];

    try {
        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query } },
                    { email: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 10,
        });
        return customers;
    } catch (error) {
        console.error("Error searching customers:", error);
        return [];
    }
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";
import { calculateGST, calculateTotal } from "@/lib/invoice-utils";

const invoiceSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    amount: z.number().positive("Amount must be positive"),
    isGst: z.boolean(),
});

// Generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const count = await prisma.invoice.count({
        where: {
            generatedAt: {
                gte: new Date(today.setHours(0, 0, 0, 0)),
            },
        },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `INV${year}${month}${sequence}`;
}

// Re-export utility functions for backward compatibility
export { calculateGST, calculateTotal };

export async function generateInvoice(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const orderId = formData.get("orderId") as string;
        const amount = parseFloat(formData.get("amount") as string);
        const isGst = formData.get("isGst") === "true";

        // Validate
        const validated = invoiceSchema.parse({
            orderId,
            amount,
            isGst,
        });

        // Check if order exists
        const order = await prisma.order.findUnique({
            where: { id: validated.orderId },
        });

        if (!order) {
            return { message: "Order not found" };
        }

        // Generate invoice number
        const invoiceNo = await generateInvoiceNumber();

        // Calculate GST
        const gstAmount = validated.isGst ? calculateGST(validated.amount) : 0;

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNo,
                orderId: validated.orderId,
                amount: validated.amount,
                gstAmount,
                isGst: validated.isGst,
                status: "DRAFT",
            },
        });

        revalidatePath("/dashboard/invoices");
        revalidatePath(`/dashboard/orders/${validated.orderId}`);
        return {
            message: "Invoice generated successfully",
            invoiceId: invoice.id,
            invoiceNo: invoice.invoiceNo
        };
    } catch (error) {
        console.error("Error generating invoice:", error);
        if (error instanceof z.ZodError) {
            return { message: error.issues[0].message };
        }
        return { message: "Failed to generate invoice" };
    }
}

export async function getInvoices() {
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                order: {
                    include: {
                        branch: true,
                    },
                },
            },
            orderBy: {
                generatedAt: "desc",
            },
        });

        return invoices;
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
    }
}

export async function getInvoiceById(id: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        branch: true,
                        items: true,
                    },
                },
            },
        });

        return invoice;
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return null;
    }
}

export async function updateInvoiceStatus(id: string, status: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.invoice.update({
            where: { id },
            data: { status },
        });

        revalidatePath("/dashboard/invoices");
        revalidatePath(`/dashboard/invoices/${id}`);
        return { message: "Invoice status updated successfully" };
    } catch (error) {
        console.error("Error updating invoice status:", error);
        return { message: "Failed to update invoice status" };
    }
}

export async function updateInvoice(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const amount = parseFloat(formData.get("amount") as string);
        const isGst = formData.get("isGst") === "true";

        if (isNaN(amount) || amount <= 0) {
            return { message: "Invalid amount" };
        }

        const gstAmount = isGst ? calculateGST(amount) : 0;

        await prisma.invoice.update({
            where: { id },
            data: {
                amount,
                gstAmount,
                isGst,
            },
        });

        revalidatePath("/dashboard/invoices");
        revalidatePath(`/dashboard/invoices/${id}`);
        return { message: "Invoice updated successfully" };
    } catch (error) {
        console.error("Error updating invoice:", error);
        return { message: "Failed to update invoice" };
    }
}

export async function getCompletedOrdersWithoutInvoice() {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: "COMPLETED",
                invoices: {
                    none: {},
                },
            },
            include: {
                items: true,
                branch: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return orders;
    } catch (error) {
        console.error("Error fetching completed orders:", error);
        return [];
    }
}


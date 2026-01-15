"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Get all product sales
 */
export async function getProductSales(
    startDate?: Date,
    endDate?: Date,
    paymentStatus?: string
) {
    try {
        const where: any = {};

        if (startDate || endDate) {
            where.saleDate = {};
            if (startDate) where.saleDate.gte = startDate;
            if (endDate) where.saleDate.lte = endDate;
        }

        if (paymentStatus) where.paymentStatus = paymentStatus;

        const sales = await prisma.finalProductSale.findMany({
            where,
            orderBy: { saleDate: "desc" },
        });

        return sales;
    } catch (error) {
        console.error("Error fetching product sales:", error);
        return [];
    }
}

/**
 * Get sale by ID
 */
export async function getSaleById(id: string) {
    try {
        const sale = await prisma.finalProductSale.findUnique({
            where: { id },
        });

        return sale;
    } catch (error) {
        console.error("Error fetching sale:", error);
        return null;
    }
}

/**
 * Create product sale
 */
export async function createProductSale(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const productName = formData.get("productName") as string;
        const description = formData.get("description") as string;
        const quantity = parseFloat(formData.get("quantity") as string);
        const unit = formData.get("unit") as string;
        const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string);
        const customerName = formData.get("customerName") as string;
        const customerPhone = formData.get("customerPhone") as string;
        const customerAddress = formData.get("customerAddress") as string;
        const saleDate = formData.get("saleDate")
            ? new Date(formData.get("saleDate") as string)
            : new Date();
        const paymentStatus = formData.get("paymentStatus") as string || "PENDING";
        const paidAmount = parseFloat(formData.get("paidAmount") as string) || 0;
        const notes = formData.get("notes") as string;

        if (!productName || !quantity || !unit || !pricePerUnit) {
            return { message: "Product name, quantity, unit, and price are required" };
        }

        const totalPrice = quantity * pricePerUnit;

        const sale = await prisma.finalProductSale.create({
            data: {
                productName,
                description: description || undefined,
                quantity,
                unit,
                pricePerUnit,
                totalPrice,
                customerName: customerName || undefined,
                customerPhone: customerPhone || undefined,
                customerAddress: customerAddress || undefined,
                saleDate,
                paymentStatus,
                paidAmount,
                notes: notes || undefined,
            },
        });

        revalidatePath("/dashboard/marketing/sales");
        return {
            message: "Product sale recorded successfully",
            saleId: sale.id,
        };
    } catch (error) {
        console.error("Error creating product sale:", error);
        return { message: "Failed to record product sale" };
    }
}

/**
 * Update product sale
 */
export async function updateProductSale(
    id: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const productName = formData.get("productName") as string;
        const description = formData.get("description") as string;
        const quantity = parseFloat(formData.get("quantity") as string);
        const unit = formData.get("unit") as string;
        const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string);
        const customerName = formData.get("customerName") as string;
        const customerPhone = formData.get("customerPhone") as string;
        const customerAddress = formData.get("customerAddress") as string;
        const saleDate = formData.get("saleDate")
            ? new Date(formData.get("saleDate") as string)
            : new Date();
        const paymentStatus = formData.get("paymentStatus") as string;
        const paidAmount = parseFloat(formData.get("paidAmount") as string) || 0;
        const notes = formData.get("notes") as string;

        if (!productName || !quantity || !unit || !pricePerUnit) {
            return { message: "Product name, quantity, unit, and price are required" };
        }

        const totalPrice = quantity * pricePerUnit;

        await prisma.finalProductSale.update({
            where: { id },
            data: {
                productName,
                description: description || undefined,
                quantity,
                unit,
                pricePerUnit,
                totalPrice,
                customerName: customerName || undefined,
                customerPhone: customerPhone || undefined,
                customerAddress: customerAddress || undefined,
                saleDate,
                paymentStatus,
                paidAmount,
                notes: notes || undefined,
            },
        });

        revalidatePath("/dashboard/marketing/sales");
        revalidatePath(`/dashboard/marketing/sales/${id}`);
        return { message: "Product sale updated successfully" };
    } catch (error) {
        console.error("Error updating product sale:", error);
        return { message: "Failed to update product sale" };
    }
}

/**
 * Delete product sale
 */
export async function deleteProductSale(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.finalProductSale.delete({
            where: { id },
        });

        revalidatePath("/dashboard/marketing/sales");
        return { message: "Product sale deleted successfully" };
    } catch (error) {
        console.error("Error deleting product sale:", error);
        return { message: "Failed to delete product sale" };
    }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
    id: string,
    paymentStatus: string,
    paidAmount: number
) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        await prisma.finalProductSale.update({
            where: { id },
            data: {
                paymentStatus,
                paidAmount,
            },
        });

        revalidatePath("/dashboard/marketing/sales");
        return { message: "Payment status updated successfully" };
    } catch (error) {
        console.error("Error updating payment status:", error);
        return { message: "Failed to update payment status" };
    }
}

/**
 * Get product sale statistics
 */
export async function getProductSaleStats(startDate?: Date, endDate?: Date) {
    try {
        const where: any = {};

        if (startDate || endDate) {
            where.saleDate = {};
            if (startDate) where.saleDate.gte = startDate;
            if (endDate) where.saleDate.lte = endDate;
        }

        const [
            totalSales,
            totalRevenue,
            totalPaid,
            totalPending,
            byPaymentStatus,
            byProduct,
        ] = await Promise.all([
            prisma.finalProductSale.count({ where }),
            prisma.finalProductSale.aggregate({
                where,
                _sum: {
                    totalPrice: true,
                },
            }),
            prisma.finalProductSale.aggregate({
                where,
                _sum: {
                    paidAmount: true,
                },
            }),
            prisma.finalProductSale.aggregate({
                where: {
                    ...where,
                    paymentStatus: { not: "PAID" },
                },
                _sum: {
                    totalPrice: true,
                    paidAmount: true,
                },
            }),
            prisma.finalProductSale.groupBy({
                by: ["paymentStatus"],
                where,
                _count: true,
                _sum: {
                    totalPrice: true,
                    paidAmount: true,
                },
            }),
            prisma.finalProductSale.groupBy({
                by: ["productName"],
                where,
                _count: true,
                _sum: {
                    quantity: true,
                    totalPrice: true,
                },
            }),
        ]);

        const pendingAmount = (totalPending._sum.totalPrice || 0) - (totalPending._sum.paidAmount || 0);

        return {
            totalSales,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
            totalPaid: totalPaid._sum.paidAmount || 0,
            pendingAmount,
            byPaymentStatus,
            byProduct,
        };
    } catch (error) {
        console.error("Error fetching product sale stats:", error);
        return {
            totalSales: 0,
            totalRevenue: 0,
            totalPaid: 0,
            pendingAmount: 0,
            byPaymentStatus: [],
            byProduct: [],
        };
    }
}

/**
 * Get pending payments
 */
export async function getPendingPayments() {
    try {
        const sales = await prisma.finalProductSale.findMany({
            where: {
                paymentStatus: { not: "PAID" },
            },
            orderBy: { saleDate: "desc" },
        });

        return sales;
    } catch (error) {
        console.error("Error fetching pending payments:", error);
        return [];
    }
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PaymentMethod, PaymentStatus, AccountingType } from "@prisma/client";

// Generate unique bill number
async function generateBillNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await prisma.pOSTransaction.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `BILL${year}${month}${day}${sequence}`;
}

export async function createPOSTransaction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const storeId = formData.get("storeId") as string;
        const customerId = formData.get("customerId") as string | null;
        const customerName = formData.get("customerName") as string | null;
        const subtotal = parseFloat(formData.get("subtotal") as string);
        const discount = parseFloat(formData.get("discount") as string) || 0;
        const taxAmount = parseFloat(formData.get("taxAmount") as string) || 0;
        const totalAmount = parseFloat(formData.get("totalAmount") as string);
        const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
        const itemsJson = formData.get("items") as string;
        const paymentsJson = formData.get("payments") as string;

        const items = JSON.parse(itemsJson);
        const payments = JSON.parse(paymentsJson);

        const billNumber = await generateBillNumber();

        // Create transaction with items and payments
        const transaction = await prisma.pOSTransaction.create({
            data: {
                billNumber,
                storeId,
                customerId: customerId || null,
                customerName: customerName || null,
                subtotal,
                discount,
                taxAmount,
                totalAmount,
                paymentMethod,
                paymentStatus: PaymentStatus.COMPLETED,
                cashierId: session.user.id,
                items: {
                    create: items,
                },
                payments: {
                    create: payments,
                },
            },
        });

        // Update store inventory
        for (const item of items) {
            await prisma.storeInventory.update({
                where: {
                    storeId_sku: {
                        storeId,
                        sku: item.sku,
                    },
                },
                data: {
                    quantity: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        // Create accounting entry
        await prisma.accountingEntry.create({
            data: {
                entryType: AccountingType.SALE,
                transactionId: transaction.id,
                description: `Sale - Bill ${billNumber}`,
                debitAccount: "Cash/Bank",
                creditAccount: "Sales Revenue",
                amount: totalAmount,
            },
        });

        revalidatePath("/dashboard/pos");
        revalidatePath("/dashboard/pos/transactions");
        revalidatePath(`/dashboard/stores/${storeId}/inventory`);
        return { message: "Sale completed successfully", billNumber, transactionId: transaction.id };
    } catch (error) {
        console.error("Error creating POS transaction:", error);
        return { message: "Failed to complete sale" };
    }
}

export async function getPOSTransactions(storeId?: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    paymentMethod?: PaymentMethod;
}) {
    const session = await auth();
    if (!session) return [];

    try {
        const where: any = {};

        if (storeId) {
            where.storeId = storeId;
        }

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }

        if (filters?.paymentMethod) {
            where.paymentMethod = filters.paymentMethod;
        }

        const transactions = await prisma.pOSTransaction.findMany({
            where,
            include: {
                store: true,
                customer: true,
                cashier: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: true,
                payments: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return transactions;
    } catch (error) {
        console.error("Error fetching POS transactions:", error);
        return [];
    }
}

export async function getPOSTransactionById(id: string) {
    const session = await auth();
    if (!session) return null;

    try {
        const transaction = await prisma.pOSTransaction.findUnique({
            where: { id },
            include: {
                store: true,
                customer: true,
                cashier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: true,
                payments: true,
                accountingEntry: true,
            },
        });

        return transaction;
    } catch (error) {
        console.error("Error fetching POS transaction:", error);
        return null;
    }
}

export async function refundPOSTransaction(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        const transaction = await prisma.pOSTransaction.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!transaction) {
            return { message: "Transaction not found" };
        }

        if (transaction.paymentStatus === PaymentStatus.REFUNDED) {
            return { message: "Transaction already refunded" };
        }

        // Update transaction status
        await prisma.pOSTransaction.update({
            where: { id },
            data: {
                paymentStatus: PaymentStatus.REFUNDED,
            },
        });

        // Restore inventory
        for (const item of transaction.items) {
            await prisma.storeInventory.update({
                where: {
                    storeId_sku: {
                        storeId: transaction.storeId,
                        sku: item.sku,
                    },
                },
                data: {
                    quantity: {
                        increment: item.quantity,
                    },
                },
            });
        }

        // Create refund accounting entry
        await prisma.accountingEntry.create({
            data: {
                entryType: AccountingType.ADJUSTMENT,
                description: `Refund - Bill ${transaction.billNumber}`,
                debitAccount: "Sales Revenue",
                creditAccount: "Cash/Bank",
                amount: transaction.totalAmount,
            },
        });

        revalidatePath("/dashboard/pos/transactions");
        revalidatePath(`/dashboard/pos/transactions/${id}`);
        revalidatePath(`/dashboard/stores/${transaction.storeId}/inventory`);
        return { message: "Transaction refunded successfully" };
    } catch (error) {
        console.error("Error refunding transaction:", error);
        return { message: "Failed to refund transaction" };
    }
}

export async function getDailySales(storeId: string, date: Date) {
    const session = await auth();
    if (!session) return null;

    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const transactions = await prisma.pOSTransaction.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                paymentStatus: PaymentStatus.COMPLETED,
            },
            include: {
                items: true,
                payments: true,
            },
        });

        const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalDiscount = transactions.reduce((sum, t) => sum + t.discount, 0);
        const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0);
        const transactionCount = transactions.length;

        const paymentBreakdown = {
            cash: 0,
            card: 0,
            upi: 0,
            mixed: 0,
        };

        transactions.forEach(t => {
            if (t.paymentMethod === PaymentMethod.CASH) paymentBreakdown.cash += t.totalAmount;
            else if (t.paymentMethod === PaymentMethod.CARD) paymentBreakdown.card += t.totalAmount;
            else if (t.paymentMethod === PaymentMethod.UPI) paymentBreakdown.upi += t.totalAmount;
            else if (t.paymentMethod === PaymentMethod.MIXED) paymentBreakdown.mixed += t.totalAmount;
        });

        return {
            date,
            totalSales,
            totalDiscount,
            totalTax,
            transactionCount,
            paymentBreakdown,
            transactions,
        };
    } catch (error) {
        console.error("Error fetching daily sales:", error);
        return null;
    }
}

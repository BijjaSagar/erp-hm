"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { AccountingType } from "@prisma/client";

export async function getAccountingEntries(filters?: {
    startDate?: Date;
    endDate?: Date;
    entryType?: AccountingType;
}) {
    const session = await auth();
    if (!session) return [];

    try {
        const where: any = {};

        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            if (filters.startDate) {
                where.date.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.date.lte = filters.endDate;
            }
        }

        if (filters?.entryType) {
            where.entryType = filters.entryType;
        }

        const entries = await prisma.accountingEntry.findMany({
            where,
            include: {
                transaction: {
                    include: {
                        store: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        return entries;
    } catch (error) {
        console.error("Error fetching accounting entries:", error);
        return [];
    }
}

export async function createAccountingEntry(data: {
    entryType: AccountingType;
    description: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    date?: Date;
}) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT")) {
        return { message: "Unauthorized" };
    }

    try {
        await prisma.accountingEntry.create({
            data: {
                entryType: data.entryType,
                description: data.description,
                debitAccount: data.debitAccount,
                creditAccount: data.creditAccount,
                amount: data.amount,
                date: data.date || new Date(),
            },
        });

        return { message: "Accounting entry created successfully" };
    } catch (error) {
        console.error("Error creating accounting entry:", error);
        return { message: "Failed to create accounting entry" };
    }
}

export async function getStoreFinancials(storeId: string, startDate: Date, endDate: Date) {
    const session = await auth();
    if (!session) return null;

    try {
        // Get all sales transactions
        const salesTransactions = await prisma.pOSTransaction.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                paymentStatus: "COMPLETED",
            },
        });

        const totalRevenue = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalDiscount = salesTransactions.reduce((sum, t) => sum + t.discount, 0);
        const totalTax = salesTransactions.reduce((sum, t) => sum + t.taxAmount, 0);
        const grossSales = salesTransactions.reduce((sum, t) => sum + t.subtotal, 0);

        // Get expenses (if any accounting entries exist)
        const expenses = await prisma.accountingEntry.findMany({
            where: {
                entryType: AccountingType.EXPENSE,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                transaction: {
                    storeId,
                },
            },
        });

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
            period: {
                start: startDate,
                end: endDate,
            },
            revenue: {
                gross: grossSales,
                discount: totalDiscount,
                tax: totalTax,
                net: totalRevenue,
            },
            expenses: totalExpenses,
            profit: totalRevenue - totalExpenses,
            transactionCount: salesTransactions.length,
        };
    } catch (error) {
        console.error("Error fetching store financials:", error);
        return null;
    }
}

export async function getDailyReport(storeId: string, date: Date) {
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
            },
            include: {
                payments: true,
            },
        });

        const completed = transactions.filter(t => t.paymentStatus === "COMPLETED");
        const refunded = transactions.filter(t => t.paymentStatus === "REFUNDED");

        const cashPayments = completed
            .flatMap(t => t.payments)
            .filter(p => p.method === "CASH")
            .reduce((sum, p) => sum + p.amount, 0);

        const cardPayments = completed
            .flatMap(t => t.payments)
            .filter(p => p.method === "CARD")
            .reduce((sum, p) => sum + p.amount, 0);

        const upiPayments = completed
            .flatMap(t => t.payments)
            .filter(p => p.method === "UPI")
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            date,
            summary: {
                totalTransactions: transactions.length,
                completedTransactions: completed.length,
                refundedTransactions: refunded.length,
                totalSales: completed.reduce((sum, t) => sum + t.totalAmount, 0),
                totalRefunds: refunded.reduce((sum, t) => sum + t.totalAmount, 0),
            },
            payments: {
                cash: cashPayments,
                card: cardPayments,
                upi: upiPayments,
                total: cashPayments + cardPayments + upiPayments,
            },
        };
    } catch (error) {
        console.error("Error fetching daily report:", error);
        return null;
    }
}

// Financial Dashboard Functions

export async function getFinancialOverview(startDate?: Date, endDate?: Date) {
    const session = await auth();
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
        return null;
    }

    try {
        const start = startDate || new Date(new Date().setDate(1)); // First day of current month
        const end = endDate || new Date();

        // Get all completed POS transactions
        const transactions = await prisma.pOSTransaction.findMany({
            where: {
                createdAt: { gte: start, lte: end },
                paymentStatus: "COMPLETED"
            }
        });

        const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0);

        // Get all expenses
        const expenses = await prisma.accountingEntry.findMany({
            where: {
                entryType: AccountingType.EXPENSE,
                date: { gte: start, lte: end }
            }
        });

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Get outstanding invoices
        const outstandingInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ["PENDING", "PARTIAL"] }
            }
        });

        const totalOutstanding = outstandingInvoices.reduce((sum, inv) => {
            const total = inv.amount + inv.gstAmount;
            return sum + total;
        }, 0);

        // Calculate profit
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            period: { start, end },
            metrics: {
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin,
                totalTax,
                totalOutstanding,
                transactionCount: transactions.length
            }
        };
    } catch (error) {
        console.error("Error fetching financial overview:", error);
        return null;
    }
}

export async function getRevenueTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly', months: number = 6) {
    const session = await auth();
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
        return [];
    }

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const transactions = await prisma.pOSTransaction.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                paymentStatus: "COMPLETED"
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by period
        const grouped: Record<string, { revenue: number, transactions: number }> = {};

        transactions.forEach(t => {
            let key: string;
            const date = new Date(t.createdAt);

            if (period === 'daily') {
                key = date.toISOString().split('T')[0];
            } else if (period === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!grouped[key]) {
                grouped[key] = { revenue: 0, transactions: 0 };
            }
            grouped[key].revenue += t.totalAmount;
            grouped[key].transactions += 1;
        });

        return Object.entries(grouped).map(([period, data]) => ({
            period,
            revenue: data.revenue,
            transactions: data.transactions
        }));
    } catch (error) {
        console.error("Error fetching revenue trends:", error);
        return [];
    }
}

export async function getExpenseBreakdown(startDate?: Date, endDate?: Date) {
    const session = await auth();
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
        return [];
    }

    try {
        const start = startDate || new Date(new Date().setDate(1));
        const end = endDate || new Date();

        const expenses = await prisma.accountingEntry.findMany({
            where: {
                entryType: AccountingType.EXPENSE,
                date: { gte: start, lte: end }
            }
        });

        // Group by debit account (expense category)
        const breakdown: Record<string, number> = {};

        expenses.forEach(e => {
            const category = e.debitAccount || 'Uncategorized';
            breakdown[category] = (breakdown[category] || 0) + e.amount;
        });

        return Object.entries(breakdown).map(([category, amount]) => ({
            category,
            amount,
            percentage: 0 // Will be calculated on frontend
        }));
    } catch (error) {
        console.error("Error fetching expense breakdown:", error);
        return [];
    }
}

export async function getTopRevenueProducts(limit: number = 10, startDate?: Date, endDate?: Date) {
    const session = await auth();
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
        return [];
    }

    try {
        const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
        const end = endDate || new Date();

        const items = await prisma.pOSTransactionItem.findMany({
            where: {
                transaction: {
                    createdAt: { gte: start, lte: end },
                    paymentStatus: "COMPLETED"
                }
            },
            include: {
                transaction: true
            }
        });

        // Group by product
        const productRevenue: Record<string, { revenue: number, quantity: number }> = {};

        items.forEach(item => {
            const product = item.productName;
            if (!productRevenue[product]) {
                productRevenue[product] = { revenue: 0, quantity: 0 };
            }
            productRevenue[product].revenue += item.totalPrice;
            productRevenue[product].quantity += item.quantity;
        });

        return Object.entries(productRevenue)
            .map(([product, data]) => ({
                product,
                revenue: data.revenue,
                quantity: data.quantity
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    } catch (error) {
        console.error("Error fetching top revenue products:", error);
        return [];
    }
}

export async function getCashFlowSummary(startDate?: Date, endDate?: Date) {
    const session = await auth();
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
        return null;
    }

    try {
        const start = startDate || new Date(new Date().setDate(1));
        const end = endDate || new Date();

        // Cash inflows (revenue)
        const revenue = await prisma.pOSTransaction.findMany({
            where: {
                createdAt: { gte: start, lte: end },
                paymentStatus: "COMPLETED"
            }
        });

        const cashInflow = revenue.reduce((sum, t) => sum + t.totalAmount, 0);

        // Cash outflows (expenses)
        const expenses = await prisma.accountingEntry.findMany({
            where: {
                entryType: AccountingType.EXPENSE,
                date: { gte: start, lte: end }
            }
        });

        const cashOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);

        const netCashFlow = cashInflow - cashOutflow;

        return {
            period: { start, end },
            cashInflow,
            cashOutflow,
            netCashFlow,
            openingBalance: 0, // TODO: Implement opening balance tracking
            closingBalance: netCashFlow
        };
    } catch (error) {
        console.error("Error fetching cash flow summary:", error);
        return null;
    }
}

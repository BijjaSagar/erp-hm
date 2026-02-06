"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function generateBillPDF(billId: string) {
    const session = await auth();

    if (!session?.user || (session.user.role !== "MARKETING_HEAD" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    // Get the bill data
    const bill = await db.pOSTransaction.findUnique({
        where: { id: billId },
        include: {
            customer: true,
            store: true,
            items: true,
            payments: true,
        },
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);

    // Return bill data for client-side PDF generation
    return {
        success: true,
        bill: {
            billNumber: bill.billNumber,
            date: bill.createdAt.toISOString(),
            customerName: bill.customerName || bill.customer?.name || "Walk-in Customer",
            customerPhone: bill.customer?.phone,
            customerEmail: bill.customer?.email,
            customerAddress: bill.customer?.address,
            storeName: bill.store.name,
            paymentStatus: bill.paymentStatus,
            paymentMethod: bill.paymentMethod,
            items: bill.items.map(item => ({
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                totalPrice: item.totalPrice,
            })),
            subtotal: bill.subtotal,
            discount: bill.discount,
            taxAmount: bill.taxAmount,
            totalAmount: bill.totalAmount,
            paidAmount: totalPaid,
            balanceDue: bill.totalAmount - totalPaid,
            notes: bill.notes,
        },
    };
}

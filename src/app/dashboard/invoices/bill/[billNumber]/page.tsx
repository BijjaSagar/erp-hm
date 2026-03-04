export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintableInvoice from "@/components/invoice/printable-invoice";
import Link from "next/link";
import InvoiceClientButtons from "./client-buttons";

async function getInvoiceData(billNumber: string) {
    try {
        const transaction = await prisma.pOSTransaction.findUnique({
            where: { billNumber },
            include: {
                store: true,
                customer: true,
                cashier: true,
                items: true,
            },
        });

        return transaction;
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return null;
    }
}

export default async function InvoicePage({ params }: { params: { billNumber: string } }) {
    const transaction = await getInvoiceData(params.billNumber);

    if (!transaction) {
        notFound();
    }

    const invoiceData = {
        billNumber: transaction.billNumber,
        date: transaction.createdAt,
        storeName: transaction.store.name,
        storeAddress: transaction.store.address,
        storePhone: transaction.store.phone || undefined,
        storeGST: transaction.store.gstNumber || undefined,
        customerName: transaction.customerName || undefined,
        customerPhone: transaction.customer?.phone || undefined,
        items: transaction.items.map(item => ({
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            totalPrice: item.totalPrice,
        })),
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        taxAmount: transaction.taxAmount,
        totalAmount: transaction.totalAmount,
        paymentMethod: transaction.paymentMethod,
        cashierName: transaction.cashier.name,
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <InvoiceClientButtons />

                {/* Invoice */}
                <PrintableInvoice invoice={invoiceData} />
            </div>
        </div>
    );
}

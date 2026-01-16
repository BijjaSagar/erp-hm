export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintableInvoice from "@/components/invoice/printable-invoice";
import { Button } from "@/components/ui/button";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
                {/* Action Buttons */}
                <div className="mb-6 flex items-center justify-between no-print">
                    <Link href="/dashboard/pos">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to POS
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => window.print()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Invoice */}
                <PrintableInvoice invoice={invoiceData} />
            </div>
        </div>
    );
}

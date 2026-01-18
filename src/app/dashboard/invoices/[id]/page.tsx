export const dynamic = 'force-dynamic';

import { getInvoiceById, updateInvoiceStatus } from "@/actions/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Printer, Download, IndianRupee } from "lucide-react";
import { notFound } from "next/navigation";
import UpdateStatusButton from "./update-status-button";
import PrintButton from "./print-button";

const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const invoice = await getInvoiceById(params.id);

    if (!invoice) {
        notFound();
    }

    const total = invoice.amount + invoice.gstAmount;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard/invoices">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Invoice {invoice.invoiceNo}
                        </h2>
                        <p className="text-muted-foreground">Generated on {new Date(invoice.generatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PrintButton />
                    <UpdateStatusButton invoiceId={invoice.id} currentStatus={invoice.status} />
                </div>
            </div>

            <Badge className={`${statusColors[invoice.status]} px-4 py-2 text-base`}>
                {invoice.status}
            </Badge>

            {/* Invoice Document */}
            <Card className="print:shadow-none">
                <CardContent className="p-8">
                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-6 mb-6">
                        <h1 className="text-4xl font-bold text-slate-900">INVOICE</h1>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Hindustan Machinery</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manufacturing & Engineering Solutions
                                </p>
                                {invoice.order.branch && (
                                    <p className="text-sm mt-2">
                                        <strong>Branch:</strong> {invoice.order.branch.name}<br />
                                        {invoice.order.branch.address}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-sm space-y-1">
                                    <div><strong>Invoice No:</strong> {invoice.invoiceNo}</div>
                                    <div><strong>Order No:</strong> {invoice.order.orderNumber}</div>
                                    <div><strong>Date:</strong> {new Date(invoice.generatedAt).toLocaleDateString('en-IN')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8">
                        <h3 className="font-semibold text-lg mb-3">Bill To:</h3>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="font-semibold text-lg">{invoice.order.customerName}</p>
                            {invoice.order.customerPhone && (
                                <p className="text-sm mt-1">Phone: {invoice.order.customerPhone}</p>
                            )}
                            {invoice.order.customerAddress && (
                                <p className="text-sm mt-1">{invoice.order.customerAddress}</p>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="text-left py-3 font-semibold">Item</th>
                                    <th className="text-center py-3 font-semibold">Quantity</th>
                                    <th className="text-left py-3 font-semibold">Specifications</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.order.items.map((item, index) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="py-3">{item.productName}</td>
                                        <td className="text-center py-3">{item.quantity}</td>
                                        <td className="py-3 text-sm text-muted-foreground">
                                            {item.dimensions && <div>Dimensions: {item.dimensions}</div>}
                                            {item.material && <div>Material: {item.material}</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-80">
                            <div className="space-y-2">
                                <div className="flex justify-between text-lg">
                                    <span>Subtotal:</span>
                                    <span className="font-medium flex items-center">
                                        <IndianRupee className="h-4 w-4 mr-1" />
                                        {invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {invoice.isGst && (
                                    <div className="flex justify-between">
                                        <span>GST (18%):</span>
                                        <span className="font-medium flex items-center">
                                            <IndianRupee className="h-4 w-4 mr-1" />
                                            {invoice.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl font-bold border-t-2 border-slate-900 pt-3">
                                    <span>Total:</span>
                                    <span className="flex items-center">
                                        <IndianRupee className="h-6 w-6 mr-1" />
                                        {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
                        <p>Thank you for your business!</p>
                        <p className="mt-2">For any queries, please contact us.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

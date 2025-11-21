export const dynamic = 'force-dynamic';

import { getInvoices } from "@/actions/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus, Eye, IndianRupee } from "lucide-react";

const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default async function InvoicesPage() {
    const invoices = await getInvoices();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h2>
                    <p className="text-muted-foreground">Manage customer invoices and payments</p>
                </div>
                <Link href="/dashboard/invoices/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice No.</TableHead>
                                <TableHead>Order No.</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>GST</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-10">
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                                            <p>No invoices found.</p>
                                            <Link href="/dashboard/invoices/new">
                                                <Button variant="link" className="mt-2">
                                                    Generate your first invoice
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((invoice) => {
                                    const total = invoice.amount + invoice.gstAmount;
                                    return (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                {invoice.invoiceNo}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/dashboard/orders/${invoice.order.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {invoice.order.orderNumber}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{invoice.order.customerName}</div>
                                                    {invoice.order.customerPhone && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {invoice.order.customerPhone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <IndianRupee className="h-3 w-3 mr-1" />
                                                    {invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {invoice.isGst ? (
                                                    <div className="flex items-center text-sm">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {invoice.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                <div className="flex items-center">
                                                    <IndianRupee className="h-3 w-3 mr-1" />
                                                    {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[invoice.status] || statusColors.DRAFT}>
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(invoice.generatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/dashboard/invoices/${invoice.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

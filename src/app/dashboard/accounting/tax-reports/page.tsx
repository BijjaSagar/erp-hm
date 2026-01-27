import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export default async function TaxReportsPage() {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT")) {
        redirect("/dashboard");
    }

    // Get all POS transactions for GST calculation
    const transactions = await prisma.pOSTransaction.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    // Get all invoices for GST calculation
    const invoices = await prisma.invoice.findMany({
        where: {
            isGst: true,
        },
        orderBy: {
            generatedAt: "desc",
        },
    });

    // Calculate tax totals
    const totalGSTCollected = transactions.reduce((sum, t) => sum + t.taxAmount, 0);
    const totalInvoiceGST = invoices.reduce((sum, i) => sum + i.gstAmount, 0);
    const totalTax = totalGSTCollected + totalInvoiceGST;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Tax Reports
                </h2>
                <p className="text-muted-foreground mt-1">
                    View GST and tax collection reports
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">POS GST Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ₹{totalGSTCollected.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {transactions.length} transactions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoice GST</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ₹{totalInvoiceGST.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {invoices.length} invoices
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tax Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{totalTax.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All sources
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* POS Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>POS Transactions with GST</CardTitle>
                    <CardDescription>
                        Recent transactions with tax collected
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No transactions found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {transactions.slice(0, 10).map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{transaction.billNumber}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                                {transaction.customerName && ` • ${transaction.customerName}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                Total: ₹{transaction.totalAmount.toLocaleString()}
                                            </p>
                                            <p className="text-lg font-bold text-blue-600">
                                                GST: ₹{transaction.taxAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Invoices with GST */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoices with GST</CardTitle>
                    <CardDescription>
                        GST invoices generated
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {invoices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No GST invoices found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {invoices.slice(0, 10).map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{invoice.invoiceNo}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(invoice.generatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                Amount: ₹{invoice.amount.toLocaleString()}
                                            </p>
                                            <p className="text-lg font-bold text-blue-600">
                                                GST: ₹{invoice.gstAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

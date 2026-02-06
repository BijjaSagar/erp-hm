import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default async function BillsPage() {
    const session = await auth();

    if (!session?.user || (session.user.role !== "MARKETING_HEAD" && session.user.role !== "ADMIN")) {
        redirect("/dashboard");
    }

    // Get all POS transactions (bills)
    const bills = await db.pOSTransaction.findMany({
        include: {
            customer: true,
            store: true,
            items: true,
            payments: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Calculate statistics
    const totalBills = bills.length;
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const pendingBills = bills.filter(b => b.paymentStatus === "PENDING");
    const completedBills = bills.filter(b => b.paymentStatus === "COMPLETED");

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Bills
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        View and manage all sales bills
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBills}</div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {completedBills.length} completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {pendingBills.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ₹{pendingBills.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Bill Value</CardTitle>
                        <FileText className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{totalBills > 0 ? Math.round(totalRevenue / totalBills).toLocaleString() : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Bills Alert */}
            {pendingBills.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <CardTitle className="text-orange-900">Pending Payments</CardTitle>
                        </div>
                        <CardDescription className="text-orange-700">
                            {pendingBills.length} bill(s) have pending payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingBills.slice(0, 5).map((bill) => (
                                <div
                                    key={bill.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{bill.billNumber}</p>
                                        <p className="text-sm text-gray-600">
                                            {bill.customerName || bill.customer?.name || "Walk-in Customer"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-orange-600">
                                            ₹{bill.totalAmount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(bill.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bills List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Bills</CardTitle>
                    <CardDescription>
                        View all sales transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {bills.map((bill) => {
                            const paymentStatusColor = {
                                COMPLETED: "bg-green-600",
                                PENDING: "bg-orange-600",
                                REFUNDED: "bg-red-600",
                                CANCELLED: "bg-gray-600",
                            }[bill.paymentStatus];

                            return (
                                <div
                                    key={bill.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{bill.billNumber}</h3>
                                            <Badge className={paymentStatusColor}>
                                                {bill.paymentStatus}
                                            </Badge>
                                            <Badge variant="outline">
                                                {bill.paymentMethod}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Customer:</span>{" "}
                                                {bill.customerName || bill.customer?.name || "Walk-in"}
                                            </div>
                                            <div>
                                                <span className="font-medium">Store:</span> {bill.store.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Items:</span> {bill.items.length}
                                            </div>
                                            <div>
                                                <span className="font-medium">Date:</span>{" "}
                                                {new Date(bill.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-xl font-bold text-green-600">
                                                ₹{bill.totalAmount.toLocaleString()}
                                            </p>
                                            {bill.discount > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    Discount: ₹{bill.discount.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/dashboard/pos/${bill.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {bills.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No bills found.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

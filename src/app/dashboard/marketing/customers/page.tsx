import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, MapPin, AlertCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CustomersPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "MARKETING_HEAD") {
        redirect("/dashboard");
    }

    // Get all customers with their transaction data
    const customers = await db.customer.findMany({
        include: {
            transactions: {
                select: {
                    totalAmount: true,
                    paymentStatus: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Calculate customer statistics
    const customersWithStats = customers.map(customer => {
        const totalPurchases = customer.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const pendingPayments = customer.transactions
            .filter(t => t.paymentStatus === "PENDING")
            .reduce((sum, t) => sum + t.totalAmount, 0);
        const lastPurchase = customer.transactions[0]?.createdAt;

        return {
            ...customer,
            totalPurchases,
            pendingPayments,
            lastPurchase,
            transactionCount: customer.transactions.length,
        };
    });

    // Get customers with pending payments for reminders
    const customersWithPendingPayments = customersWithStats.filter(c => c.pendingPayments > 0);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Customers (Party&apos;s)
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your customer relationships and track payments
                    </p>
                </div>
                <Link href="/dashboard/marketing/customers/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </Link>
            </div>

            {/* Payment Reminders */}
            {customersWithPendingPayments.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <CardTitle className="text-orange-900">Payment Reminders</CardTitle>
                        </div>
                        <CardDescription className="text-orange-700">
                            {customersWithPendingPayments.length} customer(s) have pending payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {customersWithPendingPayments.slice(0, 5).map((customer) => (
                                <div
                                    key={customer.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                        <p className="text-sm text-gray-600">{customer.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-orange-600">
                                            ₹{customer.pendingPayments.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">Pending</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Customer Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {customersWithStats.filter(c => c.transactionCount > 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {customersWithPendingPayments.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            ₹{customersWithPendingPayments.reduce((sum, c) => sum + c.pendingPayments, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customers List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Customers</CardTitle>
                    <CardDescription>
                        View and manage all your customers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {customersWithStats.map((customer) => (
                            <div
                                key={customer.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                                        <Badge variant={customer.customerType === "WHOLESALE" ? "default" : "secondary"}>
                                            {customer.customerType}
                                        </Badge>
                                        {customer.pendingPayments > 0 && (
                                            <Badge variant="destructive">
                                                ₹{customer.pendingPayments.toLocaleString()} Pending
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                                        {customer.phone && (
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {customer.phone}
                                            </div>
                                        )}
                                        {customer.email && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {customer.email}
                                            </div>
                                        )}
                                        {customer.address && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {customer.address.substring(0, 30)}...
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            {customer.transactionCount} transactions
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Purchases</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ₹{customer.totalPurchases.toLocaleString()}
                                    </p>
                                    {customer.lastPurchase && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Last: {new Date(customer.lastPurchase).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {customers.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>No customers found. Add your first customer to get started.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

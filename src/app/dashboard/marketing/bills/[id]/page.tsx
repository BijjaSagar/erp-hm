import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BillActions } from "./bill-actions";

export default async function BillDetailPage({ params }: { params: { id: string } }) {
    const session = await auth();

    if (!session?.user || (session.user.role !== "MARKETING_HEAD" && session.user.role !== "ADMIN")) {
        redirect("/dashboard");
    }

    // Get the specific bill
    const bill = await db.pOSTransaction.findUnique({
        where: { id: params.id },
        include: {
            customer: true,
            store: true,
            items: true,
            payments: true,
        },
    });

    if (!bill) {
        notFound();
    }

    const paymentStatusColor = {
        COMPLETED: "bg-green-600",
        PENDING: "bg-orange-600",
        REFUNDED: "bg-red-600",
        CANCELLED: "bg-gray-600",
    }[bill.paymentStatus];

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/marketing/bills">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Bill Details
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {bill.billNumber}
                        </p>
                    </div>
                </div>
                <BillActions billId={bill.id} />
            </div>

            {/* Bill Information */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Bill Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bill Number:</span>
                            <span className="font-semibold">{bill.billNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-semibold">
                                {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={paymentStatusColor}>
                                {bill.paymentStatus}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Method:</span>
                            <Badge variant="outline">{bill.paymentMethod}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Store:</span>
                            <span className="font-semibold">{bill.store.name}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-semibold">
                                {bill.customerName || bill.customer?.name || "Walk-in Customer"}
                            </span>
                        </div>
                        {bill.customer?.phone && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-semibold">{bill.customer.phone}</span>
                            </div>
                        )}
                        {bill.customer?.email && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-semibold">{bill.customer.email}</span>
                            </div>
                        )}
                        {bill.customer?.address && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Address:</span>
                                <span className="font-semibold text-right">{bill.customer.address}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                    <CardDescription>Products in this bill</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Product</th>
                                    <th className="text-right py-3 px-4">Quantity</th>
                                    <th className="text-right py-3 px-4">Price</th>
                                    <th className="text-right py-3 px-4">Discount</th>
                                    <th className="text-right py-3 px-4">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {item.sku}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4">{item.quantity}</td>
                                        <td className="text-right py-3 px-4">
                                            ₹{item.unitPrice.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            {item.discount > 0 ? `₹${item.discount.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="text-right py-3 px-4 font-semibold">
                                            ₹{item.totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-semibold">
                                ₹{bill.subtotal.toLocaleString()}
                            </span>
                        </div>
                        {bill.discount > 0 && (
                            <div className="flex justify-between text-lg">
                                <span className="text-muted-foreground">Discount:</span>
                                <span className="font-semibold text-red-600">
                                    -₹{bill.discount.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {bill.taxAmount > 0 && (
                            <div className="flex justify-between text-lg">
                                <span className="text-muted-foreground">Tax:</span>
                                <span className="font-semibold">
                                    ₹{bill.taxAmount.toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="border-t pt-3 flex justify-between text-2xl">
                            <span className="font-bold">Total Amount:</span>
                            <span className="font-bold text-green-600">
                                ₹{bill.totalAmount.toLocaleString()}
                            </span>
                        </div>
                        {bill.payments.length > 0 && (() => {
                            const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
                            return (
                                <>
                                    <div className="flex justify-between text-lg">
                                        <span className="text-muted-foreground">Paid Amount:</span>
                                        <span className="font-semibold text-green-600">
                                            ₹{totalPaid.toLocaleString()}
                                        </span>
                                    </div>
                                    {totalPaid < bill.totalAmount && (
                                        <div className="flex justify-between text-lg">
                                            <span className="text-muted-foreground">Balance Due:</span>
                                            <span className="font-semibold text-orange-600">
                                                ₹{(bill.totalAmount - totalPaid).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </CardContent>
            </Card>

            {/* Payment History */}
            {bill.payments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {bill.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex justify-between items-center p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.method}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">
                                            ₹{payment.amount.toLocaleString()}
                                        </p>
                                        {payment.reference && (
                                            <p className="text-xs text-muted-foreground">
                                                Ref: {payment.reference}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {bill.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{bill.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

import { getProductSales } from "@/actions/product-sale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, DollarSign, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default async function ProductSalesPage() {
    const sales = await getProductSales();

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalPaid = sales.reduce((sum, s) => sum + s.paidAmount, 0);
    const pending = totalRevenue - totalPaid;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Product Sales</h2>
                    <p className="text-muted-foreground">
                        Track final product sales and payments
                    </p>
                </div>
                <Link href="/dashboard/marketing/sales/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Sale
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Sales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sales.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Paid Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">₹{pending.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sales History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sales.map((sale) => {
                            const paymentBadge =
                                sale.paymentStatus === "PAID" ? "default" :
                                    sale.paymentStatus === "PARTIAL" ? "secondary" : "outline";

                            return (
                                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{sale.productName}</span>
                                            <Badge variant="outline">
                                                {sale.quantity} {sale.unit}
                                            </Badge>
                                            <Badge variant={paymentBadge}>
                                                {sale.paymentStatus}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(sale.saleDate), "MMM dd, yyyy")}
                                            </div>
                                            {sale.customerName && (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {sale.customerName}
                                                </div>
                                            )}
                                        </div>
                                        {sale.description && (
                                            <p className="text-sm text-muted-foreground">{sale.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">₹{sale.totalPrice.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">
                                            ₹{sale.pricePerUnit}/{sale.unit}
                                        </div>
                                        {sale.paymentStatus !== "PAID" && (
                                            <div className="text-xs text-yellow-600 mt-1">
                                                Paid: ₹{sale.paidAmount} | Due: ₹{(sale.totalPrice - sale.paidAmount).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {sales.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                            <p className="text-muted-foreground mb-4">Record your first product sale</p>
                            <Link href="/dashboard/marketing/sales/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Sale
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

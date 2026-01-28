import { getRawMaterialPurchases } from "@/actions/purchase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, ShoppingCart, Package, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function PurchasesPage() {
    const purchases = await getRawMaterialPurchases();

    const totalValue = purchases.reduce((sum, p) => sum + p.grandTotal, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Purchases</h2>
                    <p className="text-muted-foreground">
                        Track all raw material purchases
                    </p>
                </div>
                <Link href="/dashboard/purchases/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Purchase
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Purchases
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{purchases.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {purchases.filter(p =>
                                new Date(p.purchaseDate).getMonth() === new Date().getMonth()
                            ).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {purchases.map((purchase) => (
                            <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{purchase.material.name}</span>
                                        <Badge variant="outline">
                                            {purchase.quantity} {purchase.unit}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {purchase.seller.name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(purchase.purchaseDate), "MMM dd, yyyy")}
                                        </div>
                                        {purchase.billNumber && (
                                            <span>Bill: {purchase.billNumber}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">₹{purchase.grandTotal.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">
                                        ₹{purchase.pricePerUnit}/{purchase.unit}
                                    </div>
                                    {purchase.transportationCost > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                            +₹{purchase.transportationCost} transport
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {purchases.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                            <p className="text-muted-foreground mb-4">Record your first purchase to get started</p>
                            <Link href="/dashboard/purchases/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Purchase
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

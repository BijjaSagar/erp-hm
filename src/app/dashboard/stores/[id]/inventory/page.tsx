export const dynamic = 'force-dynamic';

import { getStoreById, getStoreInventory } from "@/actions/store";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Package, AlertTriangle, IndianRupee, TrendingUp } from "lucide-react";
import { UpdatePriceForm } from "./update-price-form";

export default async function StoreInventoryPage({ params }: { params: { id: string } }) {
    const session = await auth();
    const [store, inventory] = await Promise.all([
        getStoreById(params.id),
        getStoreInventory(params.id),
    ]);

    if (!store) notFound();

    const totalItems = inventory.length;
    const totalQty = inventory.reduce((s: number, i: any) => s + i.quantity, 0);
    const totalValue = inventory.reduce((s: number, i: any) => s + i.quantity * i.costPrice, 0);
    const lowStock = inventory.filter((i: any) => i.reorderLevel && i.quantity <= i.reorderLevel).length;

    const isManager = session?.user?.role === "ADMIN" || session?.user?.role === "BRANCH_MANAGER" || session?.user?.role === "STORE_MANAGER";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/stores/${params.id}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{store.name} — Inventory</h2>
                        <p className="text-muted-foreground text-sm">Products received from production and available for sale</p>
                    </div>
                </div>
                <Link href={`/dashboard/stores/${params.id}/tasks`}>
                    <Button variant="outline" size="sm">Production Tasks</Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-900">{totalItems}</div>
                        <div className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                            <Package className="h-3 w-3" /> Product Types
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-200">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-indigo-900">{totalQty}</div>
                        <div className="text-xs text-indigo-700 mt-1">Total Units</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-emerald-900">₹{totalValue.toLocaleString("en-IN")}</div>
                        <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" /> Total Value (Cost)
                        </div>
                    </CardContent>
                </Card>
                <Card className={`${lowStock > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                    <CardContent className="pt-4">
                        <div className={`text-2xl font-bold ${lowStock > 0 ? "text-red-900" : "text-green-900"}`}>{lowStock}</div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${lowStock > 0 ? "text-red-700" : "text-green-700"}`}>
                            <AlertTriangle className="h-3 w-3" /> Low Stock Items
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Warning */}
            {lowStock > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                        {lowStock} item{lowStock > 1 ? "s are" : " is"} below reorder level — consider requesting a transfer from production.
                    </p>
                </div>
            )}

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="h-4 w-4 text-blue-600" />
                        All Products ({totalItems})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {inventory.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="font-semibold">No inventory yet</p>
                            <p className="text-sm mt-1">Inventory is populated when stock transfers are received from production.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50 text-xs text-slate-600 uppercase">
                                        <th className="px-4 py-3 text-left">Product</th>
                                        <th className="px-4 py-3 text-left">SKU</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-4 py-3 text-right">Cost Price</th>
                                        <th className="px-4 py-3 text-right">Selling Price</th>
                                        <th className="px-4 py-3 text-right">Value</th>
                                        <th className="px-4 py-3 text-center">Stock</th>
                                        {isManager && <th className="px-4 py-3 text-center">Set Price</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {inventory.map((item: any) => {
                                        const isLow = item.reorderLevel && item.quantity <= item.reorderLevel;
                                        return (
                                            <tr key={item.id} className={`hover:bg-slate-50/50 ${isLow ? "bg-red-50/30" : ""}`}>
                                                <td className="px-4 py-3 font-medium">{item.productName}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                                                <td className="px-4 py-3 text-center font-bold">{item.quantity} {item.unit}</td>
                                                <td className="px-4 py-3 text-right">₹{item.costPrice.toLocaleString("en-IN")}</td>
                                                <td className="px-4 py-3 text-right text-green-700 font-medium">
                                                    {item.sellingPrice > 0 ? `₹${item.sellingPrice.toLocaleString("en-IN")}` : <span className="text-orange-500 text-xs">Not set</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">₹{(item.quantity * item.costPrice).toLocaleString("en-IN")}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {isLow ? (
                                                        <Badge className="bg-red-100 text-red-800 text-xs">Low Stock</Badge>
                                                    ) : (
                                                        <Badge className="bg-green-100 text-green-800 text-xs">OK</Badge>
                                                    )}
                                                </td>
                                                {isManager && (
                                                    <td className="px-4 py-3 text-center">
                                                        <UpdatePriceForm
                                                            storeId={params.id}
                                                            sku={item.sku}
                                                            currentCostPrice={item.costPrice}
                                                            currentSellingPrice={item.sellingPrice}
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

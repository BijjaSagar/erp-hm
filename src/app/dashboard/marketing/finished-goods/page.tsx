import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function FinishedGoodsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "MARKETING_HEAD") {
        redirect("/dashboard");
    }

    // Get all completed orders (finished goods)
    const completedOrders = await db.order.findMany({
        where: {
            status: "COMPLETED",
        },
        include: {
            items: true,
            branch: true,
            stockTransfers: {
                include: {
                    toStore: true,
                    items: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    // Get store inventory (finished goods in stores)
    const storeInventory = await db.storeInventory.findMany({
        include: {
            store: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    // Calculate statistics
    const totalFinishedProducts = completedOrders.reduce((sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const totalStoreStock = storeInventory.reduce((sum, item) => sum + item.quantity, 0);

    const lowStockItems = storeInventory.filter(item =>
        item.reorderLevel && item.quantity <= item.reorderLevel
    );

    const totalStockValue = storeInventory.reduce((sum, item) =>
        sum + (item.sellingPrice * item.quantity), 0
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Finished Goods (Stock)
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        View all completed products and store inventory
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedOrders.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalFinishedProducts} total units
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Store Stock</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStoreStock}</div>
                        <p className="text-xs text-muted-foreground">
                            {storeInventory.length} unique items
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Total inventory value
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Items need reorder
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <CardTitle className="text-orange-900">Low Stock Alert</CardTitle>
                        </div>
                        <CardDescription className="text-orange-700">
                            {lowStockItems.length} item(s) are running low on stock
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {lowStockItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{item.productName}</p>
                                        <p className="text-sm text-gray-600">{item.store.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-orange-600">
                                            {item.quantity} {item.unit}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Reorder at: {item.reorderLevel}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Store Inventory */}
            <Card>
                <CardHeader>
                    <CardTitle>Store Inventory</CardTitle>
                    <CardDescription>
                        Current stock available in all stores
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {storeInventory.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg">{item.productName}</h3>
                                        <Badge variant="outline">{item.sku}</Badge>
                                        {item.reorderLevel && item.quantity <= item.reorderLevel && (
                                            <Badge variant="destructive">Low Stock</Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Store:</span> {item.store.name}
                                        </div>
                                        <div>
                                            <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                                        </div>
                                        <div>
                                            <span className="font-medium">Cost Price:</span> ₹{item.costPrice.toLocaleString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">Selling Price:</span> ₹{item.sellingPrice.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm text-gray-500">Total Value</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {storeInventory.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No inventory found in stores.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Completed Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recently Completed Orders</CardTitle>
                    <CardDescription>
                        Orders that have finished production
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {completedOrders.slice(0, 10).map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                        <Badge variant="default" className="bg-green-600">
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Customer:</span> {order.customerName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Items:</span> {order.items.length}
                                        </div>
                                        <div>
                                            <span className="font-medium">Branch:</span> {order.branch?.name || "N/A"}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-sm font-medium">
                                        {new Date(order.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {completedOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No completed orders found.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

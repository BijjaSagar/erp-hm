import { getInventoryOverview, getStoresForTransfer } from "@/actions/stock-transfer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    TrendingDown,
    DollarSign,
    Store as StoreIcon,
    AlertTriangle
} from "lucide-react";

export default async function InventoryPage() {
    const { inventory, stats } = await getInventoryOverview();
    const stores = await getStoresForTransfer();

    // Group inventory by product SKU
    const inventoryByProduct = inventory.reduce((acc: any, item) => {
        if (!acc[item.sku]) {
            acc[item.sku] = {
                productName: item.productName,
                sku: item.sku,
                unit: item.unit,
                totalQuantity: 0,
                stores: []
            };
        }
        acc[item.sku].totalQuantity += item.quantity;
        acc[item.sku].stores.push({
            storeName: item.store.name,
            quantity: item.quantity,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            reorderLevel: item.reorderLevel,
            isLowStock: item.reorderLevel ? item.quantity <= item.reorderLevel : false
        });
        return acc;
    }, {});

    const products = Object.values(inventoryByProduct);

    return (
        <div className="p-6 space-y-6 fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Inventory Overview
                </h1>
                <p className="text-muted-foreground mt-1">
                    Monitor stock levels across all stores
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">
                            {stats.totalProducts}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <StoreIcon className="h-4 w-4" />
                            Active Stores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">
                            {stores.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">
                            ₹{stats.totalValue.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Low Stock Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-900">
                            {stats.lowStockCount}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Products Inventory
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length > 0 ? (
                        <div className="space-y-6">
                            {products.map((product: any) => (
                                <div key={product.sku} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{product.productName}</h3>
                                            <Badge variant="outline" className="font-mono mt-1">
                                                {product.sku}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Total Stock</div>
                                            <div className="text-2xl font-bold">
                                                {product.totalQuantity} {product.unit}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {product.stores.map((store: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg border ${store.isLowStock
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-200 bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-medium text-sm">{store.storeName}</div>
                                                    {store.isLowStock && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            <TrendingDown className="h-3 w-3 mr-1" />
                                                            Low Stock
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Quantity:</span>
                                                        <span className="font-semibold">{store.quantity} {product.unit}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Cost:</span>
                                                        <span>₹{store.costPrice}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Selling:</span>
                                                        <span>₹{store.sellingPrice}</span>
                                                    </div>
                                                    {store.reorderLevel && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-muted-foreground">Reorder at:</span>
                                                            <span>{store.reorderLevel}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">
                                No inventory yet
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Inventory will appear here once stock transfers are received
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

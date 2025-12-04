import { getCompletedOrdersForTransfer, getStoresForTransfer } from "@/actions/stock-transfer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowLeft,
    Package,
    Building2,
    CheckCircle2
} from "lucide-react";
import { createTransferFromForm } from "@/actions/stock-transfer-form";

export default async function NewStockTransferPage() {
    const completedOrders = await getCompletedOrdersForTransfer();
    const stores = await getStoresForTransfer();

    return (
        <div className="p-6 space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/stock-transfers">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Create Stock Transfer
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Transfer completed production to a store
                    </p>
                </div>
            </div>

            {completedOrders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                            No completed orders available
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Complete a production order first to create a transfer
                        </p>
                        <Link href="/dashboard/production">
                            <Button className="mt-4" variant="outline">
                                Go to Production
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : stores.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                            No active stores available
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create a store first to transfer stock
                        </p>
                        <Link href="/dashboard/stores">
                            <Button className="mt-4" variant="outline">
                                Go to Stores
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <form action={createTransferFromForm}>
                    <div className="space-y-6">
                        {/* Select Order */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Select Completed Order
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {completedOrders.map((order) => (
                                        <label
                                            key={order.id}
                                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="orderId"
                                                value={order.id}
                                                required
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="outline" className="font-mono">
                                                        {order.orderNumber}
                                                    </Badge>
                                                    <span className="font-medium">{order.customerName}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.items.length} item(s) • {order.branch?.name || "No Branch"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Completed: {new Date(order.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Select Store */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Select Destination Store
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {stores.map((store) => (
                                        <label
                                            key={store.id}
                                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="storeId"
                                                value={store.id}
                                                required
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium mb-1">{store.name}</div>
                                                {store.address && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {store.address}
                                                    </div>
                                                )}
                                                {store.phone && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Phone: {store.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex gap-3">
                            <Link href="/dashboard/stock-transfers">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Create Transfer
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

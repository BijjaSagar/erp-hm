import { getStockTransfers, getStoresForTransfer } from "@/actions/stock-transfer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransferStatusBadge } from "@/components/transfer-status-badge";
import Link from "next/link";
import {
    Package,
    Plus,
    ArrowRight,
    Building2,
    Calendar
} from "lucide-react";

export default async function StockTransfersPage() {
    const transfers = await getStockTransfers();
    const stores = await getStoresForTransfer();

    // Group transfers by status
    const pendingTransfers = transfers.filter(t => t.status === "PENDING");
    const inTransitTransfers = transfers.filter(t => t.status === "IN_TRANSIT");
    const recentTransfers = transfers.slice(0, 10);

    return (
        <div className="p-6 space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Stock Transfers
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage transfers from production to stores
                    </p>
                </div>
                <Link href="/dashboard/stock-transfers/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Transfer
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-700">
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-900">
                            {pendingTransfers.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">
                            In Transit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">
                            {inTransitTransfers.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">
                            Total Transfers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">
                            {transfers.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">
                            Active Stores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">
                            {stores.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transfers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Recent Transfers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentTransfers.length > 0 ? (
                        <div className="space-y-3">
                            {recentTransfers.map((transfer) => (
                                <Link
                                    key={transfer.id}
                                    href={`/dashboard/stock-transfers/${transfer.id}`}
                                >
                                    <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="font-mono">
                                                    {transfer.transferNumber}
                                                </Badge>
                                                <TransferStatusBadge status={transfer.status} />
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {transfer.fromBranch?.name || "Production"}
                                                </div>
                                                <ArrowRight className="h-3 w-3" />
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {transfer.toStore.name}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(transfer.createdAt).toLocaleDateString()}
                                                {transfer.order && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Order: {transfer.order.orderNumber}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {transfer.items.length} item(s)
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                By: {transfer.transferrer.name}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">
                                No transfers yet
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create your first transfer from a completed production order
                            </p>
                            <Link href="/dashboard/stock-transfers/new">
                                <Button className="mt-4" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Transfer
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

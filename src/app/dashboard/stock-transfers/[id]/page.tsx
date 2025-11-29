import { getStockTransferById, receiveStockTransfer, updateTransferStatus, cancelStockTransfer } from "@/actions/stock-transfer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransferStatusBadge } from "@/components/transfer-status-badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Package,
    User,
    Calendar,
    FileText,
    CheckCircle2,
    Truck,
    XCircle
} from "lucide-react";

interface TransferDetailsPageProps {
    params: {
        id: string;
    };
}

export default async function TransferDetailsPage({ params }: TransferDetailsPageProps) {
    const transfer = await getStockTransferById(params.id);

    if (!transfer) {
        notFound();
    }

    const canMarkInTransit = transfer.status === "PENDING";
    const canReceive = transfer.status === "IN_TRANSIT" || transfer.status === "PENDING";
    const canCancel = transfer.status === "PENDING" || transfer.status === "IN_TRANSIT";

    return (
        <div className="p-6 space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/stock-transfers">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Transfer {transfer.transferNumber}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage transfer details
                        </p>
                    </div>
                </div>
                <TransferStatusBadge status={transfer.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Transfer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Transfer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Transfer Number</div>
                            <div className="font-mono font-medium">{transfer.transferNumber}</div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">From</div>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {transfer.fromBranch?.name || "Production Unit"}
                                </span>
                            </div>
                            {transfer.fromBranch?.address && (
                                <div className="text-sm text-muted-foreground mt-1">
                                    {transfer.fromBranch.address}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">To</div>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{transfer.toStore.name}</span>
                            </div>
                            {transfer.toStore.address && (
                                <div className="text-sm text-muted-foreground mt-1">
                                    {transfer.toStore.address}
                                </div>
                            )}
                            {transfer.toStore.phone && (
                                <div className="text-sm text-muted-foreground">
                                    Phone: {transfer.toStore.phone}
                                </div>
                            )}
                        </div>

                        {transfer.order && (
                            <div>
                                <div className="text-sm text-muted-foreground">Related Order</div>
                                <Link href={`/dashboard/orders/${transfer.order.id}`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                        {transfer.order.orderNumber}
                                    </Badge>
                                </Link>
                                {transfer.order.customerName && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Customer: {transfer.order.customerName}
                                    </div>
                                )}
                            </div>
                        )}

                        {transfer.notes && (
                            <div>
                                <div className="text-sm text-muted-foreground">Notes</div>
                                <div className="text-sm mt-1 p-3 bg-muted rounded-lg">
                                    {transfer.notes}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">Created</div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(transfer.transferredAt).toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    By: {transfer.transferrer.name}
                                </div>
                            </div>
                        </div>

                        {transfer.status !== "PENDING" && (
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100">
                                    <Truck className="h-4 w-4 text-cyan-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">In Transit</div>
                                    <div className="text-sm text-muted-foreground">
                                        Goods dispatched from production
                                    </div>
                                </div>
                            </div>
                        )}

                        {transfer.receivedAt && transfer.receiver && (
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">Received</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(transfer.receivedAt).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        By: {transfer.receiver.name}
                                    </div>
                                </div>
                            </div>
                        )}

                        {transfer.status === "CANCELLED" && (
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">Cancelled</div>
                                    <div className="text-sm text-muted-foreground">
                                        Transfer was cancelled
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Items ({transfer.items.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">Product</th>
                                    <th className="text-left py-3 px-4 font-medium">SKU</th>
                                    <th className="text-right py-3 px-4 font-medium">Quantity</th>
                                    <th className="text-left py-3 px-4 font-medium">Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfer.items.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/50">
                                        <td className="py-3 px-4 font-medium">{item.productName}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className="font-mono">
                                                {item.sku}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3 px-4">{item.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            {(canMarkInTransit || canReceive || canCancel) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            {canMarkInTransit && (
                                <form action={async () => {
                                    "use server";
                                    await updateTransferStatus(transfer.id, "IN_TRANSIT");
                                }}>
                                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                        <Truck className="h-4 w-4 mr-2" />
                                        Mark as In Transit
                                    </Button>
                                </form>
                            )}

                            {canReceive && (
                                <form action={async () => {
                                    "use server";
                                    await receiveStockTransfer(transfer.id);
                                }}>
                                    <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600">
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Receive Transfer
                                    </Button>
                                </form>
                            )}

                            {canCancel && (
                                <form action={async () => {
                                    "use server";
                                    await cancelStockTransfer(transfer.id);
                                }}>
                                    <Button type="submit" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Transfer
                                    </Button>
                                </form>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

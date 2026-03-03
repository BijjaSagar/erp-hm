export const dynamic = 'force-dynamic';

import { getOrderById, deleteOrder } from "@/actions/order";
import { getInventoryItems } from "@/actions/raw-material";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Package, User, MapPin, Calendar, FileText, Box, TrendingDown, CheckSquare, History as HistoryIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import DeleteOrderButton from "./delete-button";
import { ApproveOrderButton } from "./approve-button";
import { MaterialAllocationForm } from "./material-allocation-form";
import { BillAndTransferButton } from "./bill-and-transfer-button";
import { getStoresForTransfer } from "@/actions/stock-transfer";

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    IN_PRODUCTION: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    DELIVERED: "bg-teal-100 text-teal-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const stageColors: Record<string, string> = {
    PENDING: "bg-slate-100 text-slate-800",
    CUTTING: "bg-orange-100 text-orange-800",
    SHAPING: "bg-amber-100 text-amber-800",
    BENDING: "bg-yellow-100 text-yellow-800",
    WELDING_INNER: "bg-lime-100 text-lime-800",
    WELDING_OUTER: "bg-emerald-100 text-emerald-800",
    GRINDING: "bg-zinc-100 text-zinc-800",
    FINISHING: "bg-cyan-100 text-cyan-800",
    PAINTING: "bg-sky-100 text-sky-800",
    PLYWOOD_FITTING: "bg-indigo-100 text-indigo-800",
    PREPARATION: "bg-teal-100 text-teal-800",
    COMPLETED: "bg-green-100 text-green-800",
};

const productionStages = [
    "PENDING", "CUTTING", "SHAPING", "BENDING",
    "WELDING_INNER", "WELDING_OUTER", "GRINDING", "FINISHING", "PAINTING", "PLYWOOD_FITTING", "PREPARATION", "COMPLETED"
];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const session = await auth();
    const [orderData, inventoryItems, stores] = await Promise.all([
        getOrderById(params.id),
        getInventoryItems(),
        getStoresForTransfer(),
    ]);

    if (!orderData) {
        notFound();
    }

    const order = orderData;
    const currentStageIndex = productionStages.indexOf(order.currentStage);
    const isManager = session?.user?.role === "ADMIN" || session?.user?.role === "BRANCH_MANAGER";

    // Material Tracking Calculations
    const totalAllocated: Record<string, { quantity: number, unit: string, name: string }> = {};
    order.materialAllocations.forEach((alloc: any) => {
        if (!totalAllocated[alloc.materialId]) {
            totalAllocated[alloc.materialId] = { quantity: 0, unit: alloc.unit, name: alloc.material.name };
        }
        totalAllocated[alloc.materialId].quantity += alloc.quantity;
    });

    const totalConsumed: Record<string, number> = {};
    order.materialConsumptions.forEach((cons: any) => {
        if (!totalConsumed[cons.materialId]) {
            totalConsumed[cons.materialId] = 0;
        }
        totalConsumed[cons.materialId] += cons.quantity;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Order {order.orderNumber}
                        </h2>
                        <p className="text-muted-foreground">Order details and production tracking</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isManager && order.status === "PENDING" && (
                        <ApproveOrderButton orderId={order.id} />
                    )}

                    {/* Branch-Specific HP1 Transfer Logic: After Finishing → Generate Bill + Transfer to HM1 */}
                    {(order.currentStage === "FINISHING" || order.currentStage === "COMPLETED") && order.branch?.code === "HP1" && (
                        <BillAndTransferButton
                            order={{
                                id: order.id,
                                orderNumber: order.orderNumber,
                                customerName: order.customerName,
                                customerPhone: order.customerPhone,
                                items: order.items || []
                            }}
                            stores={stores}
                            label="Bill & Transfer to HM1"
                        />
                    )}

                    <Link href={`/dashboard/orders/${order.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <DeleteOrderButton orderId={order.id} />
                </div>
            </div>

            {/* Status and Stage */}
            <div className="flex gap-3">
                <Badge className={`${statusColors[order.status as keyof typeof statusColors]} px-4 py-2 text-sm`}>
                    Status: {order.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`${stageColors[order.currentStage] || 'bg-slate-100'} px-4 py-2 text-sm`}>
                    Current Stage: {order.currentStage.replace('_', ' ')}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Production Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Production Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pt-2 pb-8">
                                <div className="flex justify-between items-center">
                                    {productionStages.map((stage, index) => (
                                        <div key={stage} className="flex flex-col items-center flex-1 relative z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold ${index <= currentStageIndex
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                                                : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className={`mt-2 text-[10px] sm:text-xs text-center absolute -bottom-6 w-20 ${index <= currentStageIndex ? 'font-semibold text-blue-700' : 'text-muted-foreground'
                                                }`}>
                                                {stage.replace('_', ' ')}
                                            </div>
                                            {index < productionStages.length - 1 && (
                                                <div className={`absolute top-5 left-[50%] h-0.5 w-[100%] -z-10 ${index < currentStageIndex ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-200'
                                                    }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Material Tracking Section */}
                    {isManager && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <MaterialAllocationForm orderId={order.id} inventoryItems={inventoryItems} />

                                <Card className="border-emerald-100 bg-emerald-50/30">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center">
                                            <TrendingDown className="mr-2 h-4 w-4 text-emerald-600" />
                                            Remaining Material Weight
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {Object.keys(totalAllocated).length === 0 ? (
                                            <div className="text-center py-4 text-muted-foreground text-sm">
                                                No materials allocated yet
                                            </div>
                                        ) : (
                                            Object.entries(totalAllocated).map(([id, data]) => {
                                                const consumed = totalConsumed[id] || 0;
                                                const remaining = data.quantity - consumed;
                                                const percentage = Math.min(100, (consumed / data.quantity) * 100);

                                                return (
                                                    <div key={id} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span>{data.name}</span>
                                                            <span className={remaining < 0 ? "text-red-600" : "text-emerald-700"}>
                                                                {remaining.toFixed(2)} {data.unit} left
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${remaining < 0 ? "bg-red-500" : "bg-emerald-500"}`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                                            <span>Alloted: {data.quantity} {data.unit}</span>
                                                            <span>Used: {consumed.toFixed(2)} {data.unit}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Consumption History */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center">
                                        <HistoryIcon className="mr-2 h-4 w-4 text-blue-600" />
                                        Consumption History (by Operator)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {order.materialConsumptions?.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            No consumption recorded yet.
                                        </div>
                                    ) : (
                                        <div className="relative overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-2">Stage</th>
                                                        <th className="px-4 py-2">Material</th>
                                                        <th className="px-4 py-2 text-right">Qty</th>
                                                        <th className="px-4 py-2">By</th>
                                                        <th className="px-4 py-2 text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {order.materialConsumptions.map((cons: any) => (
                                                        <tr key={cons.id} className="bg-white hover:bg-slate-50">
                                                            <td className="px-4 py-2">
                                                                <Badge variant="outline" className="text-[10px]">{cons.stage}</Badge>
                                                            </td>
                                                            <td className="px-4 py-2 font-medium">{cons.material.name}</td>
                                                            <td className="px-4 py-2 text-right font-mono">{cons.quantity} {cons.unit}</td>
                                                            <td className="px-4 py-2">{cons.employee.name}</td>
                                                            <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                                                                {new Date(cons.consumedAt).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <Package className="mr-2 h-5 w-5 text-blue-600" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg hover:border-blue-200 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex-1">
                                            <div className="font-semibold text-lg text-slate-900">{item.productName}</div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckSquare className="h-4 w-4 text-green-500" />
                                                    <span className="text-muted-foreground">Qty:</span>
                                                    <span className="font-medium">{item.quantity}</span>
                                                </div>
                                                {item.dimensions && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Box className="h-4 w-4 text-blue-400" />
                                                        <span className="text-muted-foreground">Size:</span>
                                                        <span className="font-medium">{item.dimensions}</span>
                                                    </div>
                                                )}
                                                {item.material && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Box className="h-4 w-4 text-orange-400" />
                                                        <span className="text-muted-foreground">Type:</span>
                                                        <span className="font-medium">{item.material}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Customer Information */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="flex items-center text-lg">
                                <User className="mr-2 h-5 w-5 text-indigo-600" />
                                Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase font-semibold">Name</div>
                                <div className="font-medium text-slate-900">{order.customerName}</div>
                            </div>
                            {order.customerPhone && (
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase font-semibold">Phone</div>
                                    <div className="font-medium text-slate-900">{order.customerPhone}</div>
                                </div>
                            )}
                            {order.customerAddress && (
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase font-semibold">Address</div>
                                    <div className="font-medium text-slate-900 text-sm">{order.customerAddress}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Meta Info */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="flex items-center text-lg">
                                <FileText className="mr-2 h-5 w-5 text-emerald-600" />
                                Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase font-semibold">Order #</div>
                                <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase font-semibold">Branch</div>
                                <div className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    {order.branch?.name || "System"}
                                    {order.branch?.code && <Badge variant="secondary" className="ml-1">{order.branch.code}</Badge>}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase font-semibold">Created</div>
                                <div className="font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Production Logs */}
            {order.productionLogs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingDown className="mr-2 h-5 w-5 text-purple-600 rotate-180" />
                            Production History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {order.productionLogs.map((log: any) => (
                                <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge className={stageColors[log.stage] || "bg-slate-100"}>
                                                    {log.stage.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {log.status}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        {log.employee && (
                                            <div className="text-sm mt-1.5 flex items-center gap-1.5 text-slate-600">
                                                <User className="h-3.5 w-3.5" />
                                                <span>{log.employee.name}</span>
                                            </div>
                                        )}
                                        {log.notes && (
                                            <div className="text-sm text-slate-500 mt-1.5 p-2 bg-white rounded border italic">
                                                "{log.notes}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


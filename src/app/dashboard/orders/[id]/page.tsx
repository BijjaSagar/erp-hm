export const dynamic = 'force-dynamic';

import { getOrderById, deleteOrder } from "@/actions/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Package, User, MapPin, Calendar, FileText } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import DeleteOrderButton from "./delete-button";

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    IN_PRODUCTION: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    DELIVERED: "bg-teal-100 text-teal-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const stageColors = {
    PENDING: "bg-slate-100 text-slate-800",
    CUTTING: "bg-orange-100 text-orange-800",
    SHAPING: "bg-amber-100 text-amber-800",
    BENDING: "bg-yellow-100 text-yellow-800",
    WELDING_INNER: "bg-lime-100 text-lime-800",
    WELDING_OUTER: "bg-emerald-100 text-emerald-800",
    GRINDING: "bg-zinc-100 text-zinc-800",
    FINISHING: "bg-cyan-100 text-cyan-800",
    PAINTING: "bg-sky-100 text-sky-800",
    COMPLETED: "bg-green-100 text-green-800",
};

const productionStages = [
    "PENDING", "CUTTING", "SHAPING", "BENDING",
    "WELDING_INNER", "WELDING_OUTER", "GRINDING", "FINISHING", "PAINTING", "COMPLETED"
];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const order = await getOrderById(params.id);

    if (!order) {
        notFound();
    }

    const currentStageIndex = productionStages.indexOf(order.currentStage);

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
                <div className="flex gap-2">
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
                <Badge className={`${statusColors[order.status]} px-4 py-2 text-sm`}>
                    {order.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`${stageColors[order.currentStage]} px-4 py-2 text-sm`}>
                    Current Stage: {order.currentStage.replace('_', ' ')}
                </Badge>
            </div>

            {/* Production Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Production Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <div className="flex justify-between items-center">
                            {productionStages.map((stage, index) => (
                                <div key={stage} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold ${index <= currentStageIndex
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className={`mt-2 text-xs text-center ${index <= currentStageIndex ? 'font-semibold' : 'text-muted-foreground'
                                        }`}>
                                        {stage.replace('_', ' ')}
                                    </div>
                                    {index < productionStages.length - 1 && (
                                        <div className={`absolute top-5 h-0.5 ${index < currentStageIndex ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-200'
                                            }`} style={{
                                                left: `${(index + 0.5) * (100 / productionStages.length)}%`,
                                                width: `${100 / productionStages.length}%`
                                            }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Name</div>
                            <div className="font-medium">{order.customerName}</div>
                        </div>
                        {order.customerPhone && (
                            <div>
                                <div className="text-sm text-muted-foreground">Phone</div>
                                <div className="font-medium">{order.customerPhone}</div>
                            </div>
                        )}
                        {order.customerAddress && (
                            <div>
                                <div className="text-sm text-muted-foreground">Address</div>
                                <div className="font-medium">{order.customerAddress}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-5 w-5" />
                            Order Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Order Number</div>
                            <div className="font-medium">{order.orderNumber}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Created Date</div>
                            <div className="font-medium">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                        {order.branch && (
                            <div>
                                <div className="text-sm text-muted-foreground">Branch</div>
                                <div className="font-medium">{order.branch.name}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5" />
                        Order Items
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-semibold text-lg">{item.productName}</div>
                                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Quantity:</span>{" "}
                                            <span className="font-medium">{item.quantity}</span>
                                        </div>
                                        {item.dimensions && (
                                            <div>
                                                <span className="text-muted-foreground">Dimensions:</span>{" "}
                                                <span className="font-medium">{item.dimensions}</span>
                                            </div>
                                        )}
                                        {item.material && (
                                            <div>
                                                <span className="text-muted-foreground">Material:</span>{" "}
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

            {/* Production Logs */}
            {order.productionLogs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Production History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {order.productionLogs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={stageColors[log.stage]}>
                                                {log.stage.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        {log.employee && (
                                            <div className="text-sm mt-1">
                                                By: {log.employee.name}
                                            </div>
                                        )}
                                        {log.notes && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {log.notes}
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

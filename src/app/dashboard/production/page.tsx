export const dynamic = 'force-dynamic';

import { getOrdersByStage, getProductionStats } from "@/actions/production";
import { getStoresForTransfer } from "@/actions/stock-transfer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ProductionStage } from "@prisma/client";
import { Package, ArrowRight } from "lucide-react";
import { QuickTransferButton } from "./quick-transfer-button";

const stageColors: Record<ProductionStage, string> = {
    PENDING: "bg-slate-100 text-slate-800 border-slate-300",
    CUTTING: "bg-orange-100 text-orange-800 border-orange-300",
    SHAPING: "bg-amber-100 text-amber-800 border-amber-300",
    BENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    WELDING_INNER: "bg-lime-100 text-lime-800 border-lime-300",
    WELDING_OUTER: "bg-emerald-100 text-emerald-800 border-emerald-300",
    GRINDING: "bg-zinc-100 text-zinc-800 border-zinc-300",
    FINISHING: "bg-cyan-100 text-cyan-800 border-cyan-300",
    PAINTING: "bg-sky-100 text-sky-800 border-sky-300",
    COMPLETED: "bg-green-100 text-green-800 border-green-300",
};

const stages: ProductionStage[] = [
    ProductionStage.PENDING,
    ProductionStage.CUTTING,
    ProductionStage.SHAPING,
    ProductionStage.BENDING,
    ProductionStage.WELDING_INNER,
    ProductionStage.WELDING_OUTER,
    ProductionStage.GRINDING,
    ProductionStage.FINISHING,
    ProductionStage.PAINTING,
    ProductionStage.COMPLETED,
];

export default async function ProductionPage() {
    const [orders, stats, stores] = await Promise.all([
        getOrdersByStage(),
        getProductionStats(),
        getStoresForTransfer(),
    ]);

    // Group orders by stage
    const ordersByStage: Record<ProductionStage, any[]> = stages.reduce((acc, stage) => {
        acc[stage] = orders.filter(order => order.currentStage === stage);
        return acc;
    }, {} as Record<ProductionStage, any[]>);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Production Tracking</h2>
                <p className="text-muted-foreground">Monitor orders through production stages</p>
            </div>

            {/* Production Stats */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                {stages.map((stage) => (
                    <Card key={stage} className="border-2">
                        <CardContent className="p-4 text-center">
                            <div className={`text-2xl font-bold ${stageColors[stage]}`}>
                                {stats[stage] || 0}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {stage.replace('_', ' ')}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto pb-4">
                <div className="inline-flex gap-4 min-w-full">
                    {stages.map((stage) => (
                        <div key={stage} className="flex-shrink-0 w-80">
                            <Card className={`border-2 ${stageColors[stage]}`}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                        <span>{stage.replace('_', ' ')}</span>
                                        <Badge variant="secondary" className="ml-2">
                                            {ordersByStage[stage].length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {ordersByStage[stage].length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            No orders
                                        </div>
                                    ) : (
                                        ordersByStage[stage].map((order) => (
                                            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                                                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2">
                                                    <CardContent className="p-4">
                                                        <div className="font-semibold text-sm mb-2">
                                                            {order.orderNumber}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mb-2">
                                                            {order.customerName}
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">
                                                                {order._count.items} {order._count.items === 1 ? 'item' : 'items'}
                                                            </span>
                                                            {order.branch && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {order.branch.code}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                                            {stage === ProductionStage.COMPLETED && (
                                                                <QuickTransferButton
                                                                    order={{
                                                                        id: order.id,
                                                                        orderNumber: order.orderNumber,
                                                                        customerName: order.customerName,
                                                                        items: order.items || []
                                                                    }}
                                                                    stores={stores}
                                                                />
                                                            )}
                                                            <Link href={`/dashboard/production/${order.id}/update`}>
                                                                <div className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                                                                    Update Stage
                                                                    <ArrowRight className="ml-1 h-3 w-3" />
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

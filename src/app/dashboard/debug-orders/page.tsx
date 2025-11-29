import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DebugOrdersPage() {
    // Get all orders
    const allOrders = await prisma.order.findMany({
        include: {
            branch: true,
            items: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    // Get completed orders
    const completedOrders = await prisma.order.findMany({
        where: {
            status: "COMPLETED"
        },
        include: {
            branch: true,
            items: true
        }
    });

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Debug: Orders Status</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders ({allOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {allOrders.map(order => (
                            <div key={order.id} className="p-3 border rounded">
                                <div className="flex items-center gap-3">
                                    <Badge>{order.orderNumber}</Badge>
                                    <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                                        {order.status}
                                    </Badge>
                                    <Badge variant="outline">{order.currentStage}</Badge>
                                    <span>{order.customerName}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Branch: {order.branch?.name || "N/A"} • Items: {order.items.length}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Completed Orders ({completedOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {completedOrders.length > 0 ? (
                        <div className="space-y-2">
                            {completedOrders.map(order => (
                                <div key={order.id} className="p-3 border rounded bg-green-50">
                                    <div className="flex items-center gap-3">
                                        <Badge>{order.orderNumber}</Badge>
                                        <span>{order.customerName}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No completed orders found</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

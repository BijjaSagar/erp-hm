import { getMarketingOrders } from "@/actions/marketing-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CheckCircle, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function MarketingOrdersPage() {
    const allOrders = await getMarketingOrders();

    const pendingOrders = allOrders.filter(o => o.status === "PENDING");
    const approvedOrders = allOrders.filter(o => o.status === "APPROVED");
    const inProductionOrders = allOrders.filter(o => o.status === "IN_PRODUCTION");
    const completedOrders = allOrders.filter(o => o.status === "COMPLETED");
    const deliveredOrders = allOrders.filter(o => o.status === "DELIVERED");

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
        APPROVED: "bg-green-100 text-green-800 border-green-300",
        IN_PRODUCTION: "bg-blue-100 text-blue-800 border-blue-300",
        COMPLETED: "bg-purple-100 text-purple-800 border-purple-300",
        DELIVERED: "bg-gray-100 text-gray-800 border-gray-300",
        CANCELLED: "bg-red-100 text-red-800 border-red-300",
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Orders</h2>
                    <p className="text-muted-foreground">
                        Create and track customer orders
                    </p>
                </div>
                <Link href="/dashboard/marketing/orders/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Order
                    </Button>
                </Link>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Approved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedOrders.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            In Production
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{inProductionOrders.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{completedOrders.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-600" />
                            Delivered
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{deliveredOrders.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="in-production">In Production</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {allOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No orders yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        allOrders.map((order) => (
                            <OrderCard key={order.id} order={order} statusColors={statusColors} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    {pendingOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <p className="text-muted-foreground">No pending orders</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingOrders.map((order) => (
                            <OrderCard key={order.id} order={order} statusColors={statusColors} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                    {approvedOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <p className="text-muted-foreground">No approved orders</p>
                            </CardContent>
                        </Card>
                    ) : (
                        approvedOrders.map((order) => (
                            <OrderCard key={order.id} order={order} statusColors={statusColors} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="in-production" className="space-y-4">
                    {inProductionOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No orders in production</p>
                            </CardContent>
                        </Card>
                    ) : (
                        inProductionOrders.map((order) => (
                            <OrderCard key={order.id} order={order} statusColors={statusColors} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {completedOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No completed orders</p>
                            </CardContent>
                        </Card>
                    ) : (
                        completedOrders.map((order) => (
                            <OrderCard key={order.id} order={order} statusColors={statusColors} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="delivered" className="space-y-4">
                    {deliveredOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No delivered orders</p>
                            </CardContent>
                        </Card>
                    ) : (
                        deliveredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} statusColors={statusColors} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function OrderCard({ order, statusColors }: { order: any; statusColors: Record<string, string> }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">{order.orderNumber}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}</span>
                        </div>
                    </div>
                    <Badge className={statusColors[order.status]}>
                        {order.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                        <p className="text-sm font-medium">Customer</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    {order.customerPhone && (
                        <div>
                            <p className="text-sm font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div>
                    <p className="font-semibold mb-2">Order Items ({order.items.length})</p>
                    <div className="space-y-2">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium">{item.productName}</p>
                                    {item.dimensions && (
                                        <p className="text-sm text-muted-foreground">Dimensions: {item.dimensions}</p>
                                    )}
                                </div>
                                <Badge variant="outline">
                                    Qty: {item.quantity}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

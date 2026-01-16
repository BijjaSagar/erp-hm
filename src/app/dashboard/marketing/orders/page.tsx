import { getPendingOrders, getMarketingOrders } from "@/actions/marketing-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderApprovalCard from "./order-approval-card";
import { AlertCircle, CheckCircle, Clock, XCircle, Plus, Package, Truck } from "lucide-react";
import Link from "next/link";

export default async function MarketingOrdersPage() {
    const [pendingOrders, allOrders] = await Promise.all([
        getPendingOrders(),
        getMarketingOrders(),
    ]);

    const approvedOrders = allOrders.filter(o => o.status === "APPROVED");
    const inProductionOrders = allOrders.filter(o => o.status === "IN_PRODUCTION");
    const completedOrders = allOrders.filter(o => o.status === "COMPLETED");
    const deliveredOrders = allOrders.filter(o => o.status === "DELIVERED");
    const rejectedOrders = allOrders.filter(o => o.status === "CANCELLED");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
                    <p className="text-muted-foreground">
                        Create, review, and track customer orders
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
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Pending Approval
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
                            <XCircle className="h-4 w-4 text-red-600" />
                            Rejected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedOrders.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Total Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allOrders.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Orders Alert */}
            {pendingOrders.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="h-5 w-5" />
                            Action Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-yellow-700">
                            You have {pendingOrders.length} order(s) waiting for your approval
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Orders Tabs */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending" className="relative">
                        Pending Approval
                        {pendingOrders.length > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                                {pendingOrders.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="in-production">In Production</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                                <p className="text-muted-foreground">No pending orders to review</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingOrders.map((order) => (
                            <OrderApprovalCard key={order.id} order={order} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                    {approvedOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <p className="text-muted-foreground">No approved orders yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        approvedOrders.map((order) => (
                            <OrderApprovalCard key={order.id} order={order} showActions={false} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                    {rejectedOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <p className="text-muted-foreground">No rejected orders</p>
                            </CardContent>
                        </Card>
                    ) : (
                        rejectedOrders.map((order) => (
                            <OrderApprovalCard key={order.id} order={order} showActions={false} />
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
                            <OrderApprovalCard key={order.id} order={order} showActions={false} />
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
                            <OrderApprovalCard key={order.id} order={order} showActions={false} />
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
                            <OrderApprovalCard key={order.id} order={order} showActions={false} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    {allOrders.map((order) => (
                        <OrderApprovalCard
                            key={order.id}
                            order={order}
                            showActions={order.status === "PENDING"}
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}

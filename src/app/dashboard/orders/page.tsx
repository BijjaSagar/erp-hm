export const dynamic = 'force-dynamic';

import { getOrders } from "@/actions/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Plus, Eye } from "lucide-react";

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

export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h2>
                    <p className="text-muted-foreground">Manage customer orders and track production</p>
                </div>
                <Link href="/dashboard/orders/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <Package className="h-12 w-12 mb-2 opacity-50" />
                                            <p>No orders found.</p>
                                            <Link href="/dashboard/orders/new">
                                                <Button variant="link" className="mt-2">
                                                    Create your first order
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            {order.orderNumber}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{order.customerName}</div>
                                                {order.customerPhone && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.customerPhone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {order._count.items} {order._count.items === 1 ? 'item' : 'items'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[order.status]}>
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={stageColors[order.currentStage]}>
                                                {order.currentStage.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.branch?.name || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

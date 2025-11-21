import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ClipboardList, IndianRupee, TrendingUp, Package } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

async function getDashboardStats() {
    // Get total revenue from paid invoices
    const paidInvoices = await prisma.invoice.findMany({
        where: { status: "PAID" },
    });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount + inv.gstAmount, 0);

    // Get active orders count
    const activeOrdersCount = await prisma.order.count({
        where: {
            status: {
                in: ["APPROVED", "IN_PRODUCTION"],
            },
        },
    });

    // Get active employees count
    const employeesCount = await prisma.employee.count();

    // Get active branches count
    const branchesCount = await prisma.branch.count();

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            items: true,
        },
    });

    // Get today's attendance count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await prisma.attendance.count({
        where: {
            date: { gte: today },
        },
    });

    return {
        totalRevenue,
        activeOrdersCount,
        employeesCount,
        branchesCount,
        recentOrders,
        todayAttendance,
    };
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    IN_PRODUCTION: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    DELIVERED: "bg-teal-100 text-teal-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
                <p className="text-muted-foreground">Welcome to Hindustan Machinery ERP System</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">From paid invoices</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeOrdersCount}</div>
                        <p className="text-xs text-muted-foreground">In production or approved</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.employeesCount}</div>
                        <p className="text-xs text-muted-foreground">Across all branches</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.branchesCount}</div>
                        <p className="text-xs text-muted-foreground">Operating locations</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentOrders.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.recentOrders.map((order) => (
                                    <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                            <div className="flex-1">
                                                <div className="font-medium">{order.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.customerName}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </div>
                                            </div>
                                            <Badge className={statusColors[order.status]}>
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <div className="text-sm text-muted-foreground">Attendance Marked</div>
                                    <div className="text-2xl font-bold text-blue-700">{stats.todayAttendance}</div>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <div className="text-sm text-muted-foreground">Active Orders</div>
                                    <div className="text-2xl font-bold text-green-700">{stats.activeOrdersCount}</div>
                                </div>
                                <ClipboardList className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div>
                                    <div className="text-sm text-muted-foreground">Total Branches</div>
                                    <div className="text-2xl font-bold text-purple-700">{stats.branchesCount}</div>
                                </div>
                                <Building2 className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

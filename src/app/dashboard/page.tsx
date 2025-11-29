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
    PENDING: "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-700 border border-yellow-500/20",
    APPROVED: "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border border-blue-500/20",
    IN_PRODUCTION: "bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-700 border border-purple-500/20",
    COMPLETED: "bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-700 border border-green-500/20",
    DELIVERED: "bg-gradient-to-r from-teal-500/10 to-teal-600/10 text-teal-700 border border-teal-500/20",
    CANCELLED: "bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-700 border border-red-500/20",
};

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8 fade-in">
            <div>
                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Dashboard Overview
                </h2>
                <p className="text-muted-foreground mt-2">Welcome to Hindustan Machinery ERP System</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Revenue</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <IndianRupee className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-white/80 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            From paid invoices
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Active Orders</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ClipboardList className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.activeOrdersCount}</div>
                        <p className="text-xs text-white/80 mt-2">In production or approved</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Employees</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.employeesCount}</div>
                        <p className="text-xs text-white/80 mt-2">Across all branches</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Active Branches</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.branchesCount}</div>
                        <p className="text-xs text-white/80 mt-2">Operating locations</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Orders */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            Recent Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentOrders.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">No orders yet</p>
                                <p className="text-sm mt-1">Orders will appear here once created</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentOrders.map((order) => (
                                    <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                                        <div className="flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20 cursor-pointer group">
                                            <div className="flex-1">
                                                <div className="font-semibold text-base group-hover:text-primary transition-colors">{order.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {order.customerName}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <Package className="h-3 w-3" />
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
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Today's Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                                <div>
                                    <div className="text-sm text-muted-foreground font-medium">Attendance Marked</div>
                                    <div className="text-3xl font-bold text-blue-700 mt-1">{stats.todayAttendance}</div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                <div>
                                    <div className="text-sm text-muted-foreground font-medium">Active Orders</div>
                                    <div className="text-3xl font-bold text-green-700 mt-1">{stats.activeOrdersCount}</div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <ClipboardList className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                                <div>
                                    <div className="text-sm text-muted-foreground font-medium">Total Branches</div>
                                    <div className="text-3xl font-bold text-purple-700 mt-1">{stats.branchesCount}</div>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Building2 className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRawMaterialStats } from "@/actions/raw-material";
import { getSellerStats } from "@/actions/seller";
import { getPurchaseStats } from "@/actions/purchase";
import { getMaterialUsageStats } from "@/actions/material-usage";
import { getProductSaleStats } from "@/actions/product-sale";
import Link from "next/link";
import {
    Package,
    Users,
    ShoppingCart,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Activity
} from "lucide-react";

export default async function MarketingDashboard() {
    const [
        materialStats,
        sellerStats,
        purchaseStats,
        usageStats,
        saleStats,
    ] = await Promise.all([
        getRawMaterialStats(),
        getSellerStats(),
        getPurchaseStats(),
        getMaterialUsageStats(),
        getProductSaleStats(),
    ]);

    const stats = [
        {
            title: "Raw Materials",
            value: materialStats.totalMaterials,
            icon: Package,
            href: "/dashboard/marketing/raw-materials",
            description: `${materialStats.lowStockCount} low stock`,
            trend: materialStats.lowStockCount > 0 ? "warning" : "success",
        },
        {
            title: "Active Sellers",
            value: sellerStats.activeSellers,
            icon: Users,
            href: "/dashboard/marketing/sellers",
            description: `${sellerStats.totalSellers} total`,
            trend: "neutral",
        },
        {
            title: "Total Purchases",
            value: `₹${purchaseStats.totalValue.toLocaleString()}`,
            icon: ShoppingCart,
            href: "/dashboard/marketing/purchases",
            description: `${purchaseStats.totalPurchases} transactions`,
            trend: "success",
        },
        {
            title: "Material Usage",
            value: usageStats.totalUsages,
            icon: TrendingDown,
            href: "/dashboard/marketing/usage",
            description: "Total usage records",
            trend: "neutral",
        },
        {
            title: "Total Sales",
            value: `₹${saleStats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            href: "/dashboard/marketing/sales",
            description: `${saleStats.totalSales} transactions`,
            trend: "success",
        },
        {
            title: "Pending Payments",
            value: `₹${saleStats.pendingAmount.toLocaleString()}`,
            icon: AlertTriangle,
            href: "/dashboard/marketing/sales?status=pending",
            description: "Outstanding amount",
            trend: saleStats.pendingAmount > 0 ? "warning" : "success",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Marketing Head Dashboard</h2>
                <p className="text-muted-foreground">
                    Manage raw materials, suppliers, purchases, and sales
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="hover:bg-accent transition-colors cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className={`text-xs ${stat.trend === "warning"
                                            ? "text-yellow-600"
                                            : stat.trend === "success"
                                                ? "text-green-600"
                                                : "text-muted-foreground"
                                        }`}>
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link
                            href="/dashboard/marketing/raw-materials/new"
                            className="block p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span className="font-medium">Add Raw Material</span>
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/marketing/sellers/new"
                            className="block p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">Add Seller</span>
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/marketing/purchases/new"
                            className="block p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                <span className="font-medium">Record Purchase</span>
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/marketing/sales/new"
                            className="block p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium">Record Sale</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {materialStats.lowStockCount > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {materialStats.lowStockCount} material(s) need reordering
                                </p>
                                <Link
                                    href="/dashboard/marketing/raw-materials?filter=low-stock"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    View low stock items →
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-green-600">
                                All materials are adequately stocked
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Purchases (30d)</span>
                                <span className="font-medium">{purchaseStats.totalPurchases}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sales (30d)</span>
                                <span className="font-medium">{saleStats.totalSales}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Usage Records</span>
                                <span className="font-medium">{usageStats.totalUsages}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Building2, Users, Package, DollarSign, FileText, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const settingsCategories = [
        {
            title: "Branch Management",
            description: "Manage branches, locations, and branch settings",
            icon: Building2,
            href: "/dashboard/branches",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "User Management",
            description: "Manage employees, roles, and permissions",
            icon: Users,
            href: "/dashboard/employees",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Product Catalog",
            description: "Manage products, categories, and pricing",
            icon: Package,
            href: "/dashboard/stock",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Financial Settings",
            description: "Configure invoicing, payments, and accounting",
            icon: DollarSign,
            href: "/dashboard/accounting",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Reports & Analytics",
            description: "Configure report templates and analytics",
            icon: FileText,
            href: "/dashboard/reports/production",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Notifications",
            description: "Manage email and system notifications",
            icon: Bell,
            href: "#",
            color: "text-pink-600",
            bgColor: "bg-pink-50",
            disabled: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Settings
                </h2>
                <p className="text-muted-foreground mt-2">
                    Manage your system settings and configurations
                </p>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {settingsCategories.map((category) => (
                    <Link
                        key={category.title}
                        href={category.disabled ? "#" : category.href}
                        className={category.disabled ? "pointer-events-none opacity-60" : ""}
                    >
                        <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer h-full">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-4`}>
                                    <category.icon className={`h-6 w-6 ${category.color}`} />
                                </div>
                                <CardTitle className="flex items-center justify-between">
                                    {category.title}
                                    {category.disabled && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                            Coming Soon
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* System Information */}
            <Card>
                <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>Current system configuration and status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">System Version</p>
                            <p className="text-sm text-muted-foreground">HM ERP v1.0.0</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Database Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="text-sm text-muted-foreground">Connected</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Last Backup</p>
                            <p className="text-sm text-muted-foreground">Not configured</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Storage Used</p>
                            <p className="text-sm text-muted-foreground">N/A</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/branches/new">
                            <Button variant="outline">
                                <Building2 className="mr-2 h-4 w-4" />
                                Add Branch
                            </Button>
                        </Link>
                        <Link href="/dashboard/employees/new">
                            <Button variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        </Link>
                        <Link href="/dashboard/stores/new">
                            <Button variant="outline">
                                <Package className="mr-2 h-4 w-4" />
                                Add Store
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

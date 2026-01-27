"use client";

import { signOutAction } from "@/lib/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Users,
    MapPin,
    ClipboardList,
    Factory,
    FileText,
    Settings,
    LogOut,
    Menu,
    Wrench,
    Store,
    ShoppingCart,
    Package,
    DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Role } from "@prisma/client";

// Update routes to include roles
const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-blue-400",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Branch Management",
        icon: Building2,
        href: "/dashboard/branches",
        color: "text-violet-400",
        roles: ["ADMIN"],
    },
    {
        label: "Employees",
        icon: Users,
        href: "/dashboard/employees",
        color: "text-pink-400",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Attendance (GIS)",
        icon: MapPin,
        href: "/dashboard/attendance",
        color: "text-orange-400",
        roles: ["ADMIN", "OPERATOR", "PRODUCTION_SUPERVISOR"],
    },
    {
        label: "Orders",
        icon: ClipboardList,
        href: "/dashboard/orders",
        color: "text-emerald-400",
        roles: ["ADMIN", "ORDER_TAKER", "PRODUCTION_SUPERVISOR"],
    },
    {
        label: "Production",
        icon: Factory,
        href: "/dashboard/production",
        color: "text-green-400",
        roles: ["ADMIN", "PRODUCTION_SUPERVISOR", "BRANCH_MANAGER"],
    },
    {
        name: "Finance & Invoices",
        icon: FileText,
        href: "/dashboard/invoices",
        color: "text-blue-400",
        roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
        name: "Stores",
        icon: Store,
        href: "/dashboard/stores",
        color: "text-purple-400",
        roles: ["ADMIN", "STORE_MANAGER"],
    },
    {
        name: "POS",
        icon: ShoppingCart,
        href: "/dashboard/pos",
        color: "text-cyan-400",
        roles: ["ADMIN", "STORE_MANAGER"],
    },
    {
        name: "Contra Entry",
        icon: FileText,
        href: "/dashboard/pos/contra-entry",
        color: "text-teal-400",
        roles: ["ADMIN", "STORE_MANAGER"],
    },
    {
        name: "Stock Transfers",
        icon: Package,
        href: "/dashboard/stock-transfers",
        color: "text-indigo-400",
        roles: ["ADMIN", "PRODUCTION_SUPERVISOR", "STORE_MANAGER"],
    },
    {
        name: "Accounting",
        icon: DollarSign,
        href: "/dashboard/accounting",
        color: "text-emerald-400",
        roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
        name: "Operator Dashboard",
        href: "/dashboard/operator",
        icon: Wrench,
        color: "text-yellow-400",
        roles: ["ADMIN", "OPERATOR", "PRODUCTION_SUPERVISOR", "BRANCH_MANAGER"],
    },
    {
        name: "Stock",
        href: "/dashboard/stock",
        icon: ClipboardList,
        color: "text-teal-400",
        roles: ["ADMIN", "OPERATOR", "PRODUCTION_SUPERVISOR", "BRANCH_MANAGER"],
    },
    {
        name: "Production Reports",
        href: "/dashboard/reports/production",
        icon: FileText,
        color: "text-indigo-400",
        roles: ["ADMIN", "PRODUCTION_SUPERVISOR", "BRANCH_MANAGER"],
    },
    // Marketing Head Routes
    {
        label: "Marketing Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/marketing",
        color: "text-blue-400",
        roles: ["MARKETING_HEAD"],
    },
    {
        label: "Orders",
        icon: ClipboardList,
        href: "/dashboard/marketing/orders",
        color: "text-emerald-400",
        roles: ["MARKETING_HEAD"],
    },
    {
        label: "Customers (Party's)",
        icon: Users,
        href: "/dashboard/marketing/customers",
        color: "text-pink-400",
        roles: ["MARKETING_HEAD"],
    },
    {
        label: "Finished Goods",
        icon: Package,
        href: "/dashboard/marketing/finished-goods",
        color: "text-purple-400",
        roles: ["MARKETING_HEAD"],
    },

    // Admin & Manager Routes - Raw Materials Management
    {
        label: "Raw Materials",
        icon: Package,
        href: "/dashboard/raw-materials",
        color: "text-purple-400",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Sellers",
        icon: Users,
        href: "/dashboard/sellers",
        color: "text-pink-400",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Purchases",
        icon: ShoppingCart,
        href: "/dashboard/purchases",
        color: "text-cyan-400",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Material Usage",
        icon: Factory,
        href: "/dashboard/usage",
        color: "text-orange-400",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Product Sales",
        icon: DollarSign,
        href: "/dashboard/sales",
        color: "text-green-400",
        roles: ["ADMIN"],
    },
    {
        label: "Bills",
        icon: FileText,
        href: "/dashboard/marketing/bills",
        color: "text-cyan-400",
        roles: ["ADMIN"],
    },
    {
        name: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-gray-400",
        roles: ["ADMIN"],
    },
];

interface SidebarProps {
    role?: Role;
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    const filteredRoutes = routes.filter(route =>
        !route.roles || (role && route.roles.includes(role))
    );

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white border-r border-slate-700/50">
            <div className="px-3 py-2 flex-1 flex flex-col overflow-hidden">
                <Link href="/dashboard" className="flex items-center pl-3 mb-10 group">
                    <div className="relative">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            HM ERP
                        </h1>
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
                    </div>
                </Link>
                <div className="space-y-1 overflow-y-auto flex-1 pr-2">
                    {/* DEBUG: Remove after fixing */}
                    <div className="text-xs text-slate-500 px-3 py-1">
                        Role: {role || "None"}
                    </div>
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 relative overflow-hidden",
                                pathname === route.href
                                    ? "text-white bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-l-4 border-blue-400 shadow-lg shadow-blue-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center flex-1 relative z-10">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-transform group-hover:scale-110", route.color)} />
                                {route.label || route.name}
                            </div>
                            {pathname === route.href && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 border-t border-slate-700/50">
                <form action={signOutAction}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-l-4 hover:border-red-400 transition-all duration-200"
                        type="submit"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                    </Button>
                </form>
            </div>
        </div>
    );
}

export function MobileSidebar({ role }: SidebarProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900 border-slate-700/50 w-72">
                <Sidebar role={role} />
            </SheetContent>
        </Sheet>
    );
}


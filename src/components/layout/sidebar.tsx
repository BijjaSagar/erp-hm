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
    Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Role } from "@prisma/client";

// ... existing imports ...

// Update routes to include roles
const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Branch Management",
        icon: Building2,
        href: "/dashboard/branches",
        color: "text-violet-500",
        roles: ["ADMIN"],
    },
    {
        label: "Employees",
        icon: Users,
        href: "/dashboard/employees",
        color: "text-pink-700",
        roles: ["ADMIN", "BRANCH_MANAGER"],
    },
    {
        label: "Attendance (GIS)",
        icon: MapPin,
        href: "/dashboard/attendance",
        color: "text-orange-700",
        roles: ["ADMIN", "OPERATOR", "PRODUCTION_SUPERVISOR"],
    },
    {
        label: "Orders",
        icon: ClipboardList,
        href: "/dashboard/orders",
        color: "text-emerald-500",
        roles: ["ADMIN", "ORDER_TAKER", "PRODUCTION_SUPERVISOR"],
    },
    {
        label: "Production",
        icon: Factory,
        href: "/dashboard/production",
        color: "text-green-700",
        roles: ["ADMIN", "PRODUCTION_SUPERVISOR"],
    },
    {
        name: "Finance & Invoices",
        icon: FileText,
        href: "/dashboard/invoices",
        color: "text-blue-700",
        roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
        name: "Operator Dashboard",
        href: "/dashboard/operator",
        icon: Wrench,
        roles: ["ADMIN", "OPERATOR", "PRODUCTION_SUPERVISOR"],
    },
    {
        name: "Stock",
        href: "/dashboard/stock",
        icon: ClipboardList, // Reusing icon for now
        roles: ["ADMIN", "OPERATOR", "PRODUCTION_SUPERVISOR"],
    },
    {
        name: "Production Reports",
        href: "/dashboard/reports/production",
        icon: FileText,
        roles: ["ADMIN", "PRODUCTION_SUPERVISOR"],
    },
    {
        name: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
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
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        HM ERP
                    </h1>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label || route.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <form action={signOutAction}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
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
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900 border-none w-72">
                <Sidebar role={role} />
            </SheetContent>
        </Sheet>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardList,
    Clock,
    Coffee,
    Calendar,
    TrendingUp,
    AlertCircle
} from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({ title, value, subtitle, icon, variant = "default" }: StatCardProps) {
    const variantStyles = {
        default: "bg-blue-50 text-blue-600",
        success: "bg-green-50 text-green-600",
        warning: "bg-yellow-50 text-yellow-600",
        danger: "bg-red-50 text-red-600"
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${variantStyles[variant]}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}

interface DashboardStatsProps {
    stats: {
        pendingOrders: number;
        ongoingOrders: number;
        completedOrders: number;
        checkedIn: boolean;
        checkInTime?: string;
        hoursWorked: number;
        breaksToday: number;
        breakMinutes: number;
        pendingLeaves: number;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Orders"
                value={`${stats.pendingOrders + stats.ongoingOrders}`}
                subtitle={`${stats.pendingOrders} pending, ${stats.ongoingOrders} ongoing, ${stats.completedOrders} completed`}
                icon={<ClipboardList className="h-4 w-4" />}
                variant="default"
            />
            <StatCard
                title="Attendance"
                value={stats.checkedIn ? "Checked In" : "Not Checked In"}
                subtitle={stats.checkedIn ? `Started at ${stats.checkInTime} • Working ${stats.hoursWorked.toFixed(1)} hrs` : "Check in to start work"}
                icon={<Clock className="h-4 w-4" />}
                variant={stats.checkedIn ? "success" : "warning"}
            />
            <StatCard
                title="Breaks"
                value={`${stats.breaksToday} breaks`}
                subtitle={`${stats.breakMinutes} mins total today`}
                icon={<Coffee className="h-4 w-4" />}
                variant="default"
            />
            <StatCard
                title="Leaves"
                value={stats.pendingLeaves}
                subtitle={stats.pendingLeaves > 0 ? "Pending approval" : "No pending requests"}
                icon={<Calendar className="h-4 w-4" />}
                variant={stats.pendingLeaves > 0 ? "warning" : "default"}
            />
        </div>
    );
}

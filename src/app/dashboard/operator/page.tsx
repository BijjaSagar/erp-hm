import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssignedOrders, getOperatorStats } from "./actions";
import { getActiveBreak } from "./break-actions";
import { getActiveProductionSession, getOperatorMachines } from "./production-actions";
import { ProductionStage } from "@prisma/client";
import { OrderCard } from "./order-card";
import { DashboardStats } from "./dashboard-stats";
import { BreakTimer } from "./break-timer";
import { CurrentTimeDisplay } from "./current-time";
import { MachineSelector } from "./machine-selector";
import { ActiveProductionCard } from "./active-production-card";
import { AttendanceHistory } from "./attendance-history";
import { BreakHistoryView } from "./break-history";
import { LeaveRequestForm } from "./leave-request-form";
import { LeaveHistoryView } from "./leave-history";
import { WastageForm } from "./wastage-form";
import { WastageHistoryView } from "./wastage-history";
import { MachineIssueForm } from "./machine-issue-form";
import { MachineStatusList } from "./machine-status-list";
import { ProductionReports } from "./production-reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    LayoutDashboard,
    ClipboardList,
    Clock,
    Coffee,
    Calendar,
    AlertTriangle,
    Wrench,
    BarChart3,
    Settings
} from "lucide-react";

export default async function OperatorDashboard() {
    const { orders, error } = await getAssignedOrders();
    const { stats } = await getOperatorStats();
    const { break: activeBreak } = await getActiveBreak();
    const { activeSession } = await getActiveProductionSession();
    const { machines } = await getOperatorMachines();

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const stages = Object.values(ProductionStage);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Operator Dashboard</h1>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        <span className="hidden sm:inline">Orders</span>
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Attendance</span>
                    </TabsTrigger>
                    <TabsTrigger value="breaks" className="flex items-center gap-2">
                        <Coffee className="h-4 w-4" />
                        <span className="hidden sm:inline">Breaks</span>
                    </TabsTrigger>
                    <TabsTrigger value="leaves" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">Leaves</span>
                    </TabsTrigger>
                    <TabsTrigger value="wastage" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="hidden sm:inline">Wastage</span>
                    </TabsTrigger>
                    <TabsTrigger value="machines" className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        <span className="hidden sm:inline">Machines</span>
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Reports</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {stats && <DashboardStats stats={stats} />}

                    <div className="grid gap-6 md:grid-cols-3">
                        <CurrentTimeDisplay
                            checkInTime={stats?.checkInTime}
                            checkedIn={stats?.checkedIn || false}
                        />
                        <BreakTimer activeBreak={activeBreak} />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Quick Actions</h3>
                            <div className="grid gap-3">
                                <Button asChild variant="outline" className="justify-start">
                                    <Link href="?tab=wastage">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Log Wastage
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start">
                                    <Link href="?tab=machines">
                                        <Wrench className="h-4 w-4 mr-2" />
                                        Report Machine Issue
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start">
                                    <Link href="?tab=leaves">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Request Leave
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4 space-y-4">
                            {/* Machine Production Section */}
                            {activeSession ? (
                                <ActiveProductionCard session={activeSession} />
                            ) : (
                                <MachineSelector machines={machines || []} orders={orders || []} />
                            )}
                        </div>

                        <div className="col-span-3">
                            <h3 className="text-lg font-semibold mb-4">Today's Assigned Orders</h3>
                            <div className="space-y-4">
                                {orders?.slice(0, 4).map((order) => (
                                    <OrderCard key={order.id} order={order} stages={stages} />
                                ))}
                                {(!orders || orders.length === 0) && (
                                    <div className="text-center p-8 border rounded-lg bg-slate-50 text-slate-500">
                                        No orders assigned for today
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-4">
                    <h2 className="text-2xl font-bold">My Orders</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {orders?.map((order) => (
                            <OrderCard key={order.id} order={order} stages={stages} />
                        ))}
                        {orders?.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No active orders assigned.
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance">
                    <AttendanceHistory />
                </TabsContent>

                {/* Breaks Tab */}
                <TabsContent value="breaks">
                    <BreakHistoryView />
                </TabsContent>

                {/* Leaves Tab */}
                <TabsContent value="leaves">
                    <div className="grid gap-6 md:grid-cols-2">
                        <LeaveRequestForm />
                        <div>
                            <LeaveHistoryView />
                        </div>
                    </div>
                </TabsContent>

                {/* Wastage Tab */}
                <TabsContent value="wastage">
                    <div className="grid gap-6 md:grid-cols-2">
                        <WastageForm />
                        <div>
                            <WastageHistoryView />
                        </div>
                    </div>
                </TabsContent>

                {/* Machines Tab */}
                <TabsContent value="machines">
                    <div className="grid gap-6 md:grid-cols-2">
                        <MachineIssueForm />
                        <div>
                            <MachineStatusList />
                        </div>
                    </div>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports">
                    <ProductionReports />
                </TabsContent>
            </Tabs>
        </div>
    );
}

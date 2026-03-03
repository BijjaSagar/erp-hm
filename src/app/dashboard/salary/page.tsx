export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSalaryRecords, getPayrollStats, getAllAdvances } from "@/actions/salary";
import { getEmployees } from "@/actions/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Users, IndianRupee, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Plus, FileText, Gift
} from "lucide-react";
import { ProcessPayrollButton } from "./process-payroll-button";
import { MarkPaidButton } from "./mark-paid-button";

export default async function SalaryPage() {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        redirect("/dashboard");
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [stats, advances] = await Promise.all([
        getPayrollStats(currentMonth, currentYear),
        getAllAdvances(),
    ]);

    const statusColors: Record<string, string> = {
        DRAFT: "bg-yellow-100 text-yellow-800",
        PROCESSED: "bg-blue-100 text-blue-800",
        PAID: "bg-green-100 text-green-800",
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Salary & Payroll</h2>
                    <p className="text-muted-foreground mt-1">
                        {monthNames[currentMonth - 1]} {currentYear} — Monthly Payroll Management
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/salary/advance">
                        <Button variant="outline">
                            <Gift className="mr-2 h-4 w-4" />
                            Advance / Bonus
                        </Button>
                    </Link>
                    <Link href="/dashboard/salary/structures">
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Salary Structures
                        </Button>
                    </Link>
                    <ProcessPayrollButton month={currentMonth} year={currentYear} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Total Employees
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{stats?.totalEmployees ?? 0}</div>
                        <p className="text-xs text-blue-600 mt-1">In this payroll run</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-emerald-700 flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" /> Total Payable
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900">
                            ₹{(stats?.totalPayable ?? 0).toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">Net amount this month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Paid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">
                            ₹{(stats?.totalPaid ?? 0).toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-green-600 mt-1">Already disbursed</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">{stats?.pending ?? 0}</div>
                        <p className="text-xs text-orange-600 mt-1">Employees awaiting payment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payroll Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Payroll — {monthNames[currentMonth - 1]} {currentYear}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!stats || stats.records.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <IndianRupee className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="font-semibold text-lg">No payroll records yet</p>
                            <p className="text-sm mt-1">Click "Process Payroll" to calculate this month's salaries</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50 text-xs text-slate-600 uppercase">
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-center">Attendance</th>
                                        <th className="px-4 py-3 text-right">Base Salary</th>
                                        <th className="px-4 py-3 text-right">Earned</th>
                                        <th className="px-4 py-3 text-right">Advance</th>
                                        <th className="px-4 py-3 text-right">Bonus</th>
                                        <th className="px-4 py-3 text-right font-bold">Net Pay</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {stats.records.map((rec: any) => (
                                        <tr key={rec.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{rec.employee.name}</div>
                                                <div className="text-xs text-muted-foreground">{rec.employee.designation}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-green-700 font-medium">{rec.presentDays}</span>
                                                <span className="text-muted-foreground"> / {rec.workingDays}</span>
                                                {rec.absentDays > 0 && (
                                                    <div className="text-xs text-red-500">{rec.absentDays} absent</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                ₹{rec.baseSalary.toLocaleString("en-IN")}
                                                <div className="text-xs text-muted-foreground">{rec.salaryType}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ₹{rec.earnedSalary.toLocaleString("en-IN")}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-600">
                                                {rec.advanceAmount > 0 ? `-₹${rec.advanceAmount.toLocaleString("en-IN")}` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                {rec.bonusAmount > 0 ? `+₹${rec.bonusAmount.toLocaleString("en-IN")}` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-lg">
                                                ₹{rec.netSalary.toLocaleString("en-IN")}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge className={statusColors[rec.status] || ""}>
                                                    {rec.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {rec.status !== "PAID" && (
                                                    <MarkPaidButton salaryRecordId={rec.id} />
                                                )}
                                                {rec.status === "PAID" && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {rec.paidAt ? new Date(rec.paidAt).toLocaleDateString("en-IN") : "Paid"}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Advances */}
            {advances.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Gift className="h-4 w-4 text-purple-600" />
                            Recent Advances & Bonuses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {advances.slice(0, 8).map((adv: any) => (
                                <div key={adv.id} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                                            ${adv.type === "BONUS" ? "bg-green-500" : "bg-orange-500"}`}>
                                            {adv.type === "BONUS" ? "B" : "A"}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{adv.employee.name}</div>
                                            <div className="text-xs text-muted-foreground">{adv.reason}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${adv.type === "BONUS" ? "text-green-700" : "text-orange-700"}`}>
                                            {adv.type === "BONUS" ? "+" : "-"}₹{adv.amount.toLocaleString("en-IN")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(adv.date).toLocaleDateString("en-IN")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

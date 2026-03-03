export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEmployees } from "@/actions/employee";
import { getAllAdvances } from "@/actions/salary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gift, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AddAdvanceForm } from "./add-advance-form";

export default async function AdvancePage() {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        redirect("/dashboard");
    }

    const [employees, advances] = await Promise.all([
        getEmployees(),
        getAllAdvances(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/salary">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Advance / Deduction / Bonus</h2>
                    <p className="text-muted-foreground text-sm">Record advance payments, deductions, and bonuses for employees</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add New Advance Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Gift className="h-4 w-4 text-purple-600" />
                            Add Record
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddAdvanceForm employees={employees} />
                    </CardContent>
                </Card>

                {/* Recent Records */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {advances.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">No records yet</div>
                        ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {advances.map((adv: any) => (
                                    <div key={adv.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                                        <div className="flex items-center gap-3">
                                            {adv.type === "BONUS" ? (
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-orange-600" />
                                            )}
                                            <div>
                                                <div className="font-medium text-sm">{adv.employee.name}</div>
                                                <div className="text-xs text-muted-foreground">{adv.reason}</div>
                                                {adv.recoveredIn && (
                                                    <div className="text-xs text-blue-600">Deduct in: {adv.recoveredIn}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={adv.type === "BONUS"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-orange-100 text-orange-800"
                                            }>
                                                {adv.type}
                                            </Badge>
                                            <div className={`font-bold mt-1 ${adv.type === "BONUS" ? "text-green-700" : "text-orange-700"}`}>
                                                {adv.type === "BONUS" ? "+" : "-"}₹{adv.amount.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

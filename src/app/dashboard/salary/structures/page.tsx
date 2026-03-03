export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEmployees } from "@/actions/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, IndianRupee } from "lucide-react";
import Link from "next/link";
import { UpdateSalaryForm } from "./update-salary-form";

export default async function SalaryStructuresPage() {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        redirect("/dashboard");
    }

    const employees = await getEmployees();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/salary">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Salary Structures</h2>
                    <p className="text-muted-foreground text-sm">Configure monthly salary or daily wage for each employee</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((emp: any) => (
                    <Card key={emp.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                                    {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <CardTitle className="text-base">{emp.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{emp.designation} · {emp.branch?.name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Current Salary:</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{emp.salaryType || "MONTHLY"}</Badge>
                                    <span className="font-bold text-blue-700">
                                        ₹{(emp.baseSalary || 0).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                            <UpdateSalaryForm
                                employeeId={emp.id}
                                currentSalaryType={emp.salaryType || "MONTHLY"}
                                currentBaseSalary={emp.baseSalary || 0}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {employees.length === 0 && (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No employees found. Add employees first.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

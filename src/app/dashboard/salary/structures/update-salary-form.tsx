"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateEmployeeSalary } from "@/actions/salary";
import { useRouter } from "next/navigation";

export function UpdateSalaryForm({
    employeeId,
    currentSalaryType,
    currentBaseSalary,
}: {
    employeeId: string;
    currentSalaryType: string;
    currentBaseSalary: number;
}) {
    const [salaryType, setSalaryType] = useState<"MONTHLY" | "DAILY">(currentSalaryType as any);
    const [baseSalary, setBaseSalary] = useState(currentBaseSalary.toString());
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");
    const router = useRouter();

    const handle = () => {
        startTransition(async () => {
            const result = await updateEmployeeSalary(employeeId, salaryType, parseFloat(baseSalary) || 0);
            setMsg(result.message);
            router.refresh();
        });
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs">Salary Type</Label>
                    <select
                        className="w-full p-2 border rounded-md text-sm bg-white"
                        value={salaryType}
                        onChange={e => setSalaryType(e.target.value as any)}
                    >
                        <option value="MONTHLY">Monthly</option>
                        <option value="DAILY">Daily Wage</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Amount (₹)</Label>
                    <Input
                        type="number"
                        value={baseSalary}
                        onChange={e => setBaseSalary(e.target.value)}
                        placeholder="0"
                        className="text-sm"
                    />
                </div>
            </div>
            <Button size="sm" onClick={handle} disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                {isPending ? "Saving..." : "Update Salary"}
            </Button>
            {msg && <p className="text-xs text-center text-green-600">{msg}</p>}
        </div>
    );
}

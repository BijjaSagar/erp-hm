"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { createSalaryAdvance } from "@/actions/salary";
import { useRouter } from "next/navigation";

const now = new Date();
const defaultRecoveryMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;

export function AddAdvanceForm({ employees }: { employees: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");
    const router = useRouter();

    const handle = (formData: FormData) => {
        startTransition(async () => {
            const result = await createSalaryAdvance(null, formData);
            setMsg(result.message);
            if (result.message.includes("success")) router.refresh();
        });
    };

    return (
        <form action={handle} className="space-y-4">
            <div className="space-y-1.5">
                <Label>Employee *</Label>
                <select name="employeeId" required className="w-full p-2 border rounded-md text-sm bg-white">
                    <option value="">Select employee...</option>
                    {employees.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Type *</Label>
                    <select name="type" required className="w-full p-2 border rounded-md text-sm bg-white">
                        <option value="ADVANCE">Advance</option>
                        <option value="BONUS">Bonus</option>
                        <option value="DEDUCTION">Deduction</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <Label>Amount (₹) *</Label>
                    <Input name="amount" type="number" min="0" step="0.01" required placeholder="0" />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Reason *</Label>
                <Input name="reason" required placeholder="e.g. Festival bonus, Advance for medical" />
            </div>

            <div className="space-y-1.5">
                <Label>Deduct in Payroll Month (for Advance)</Label>
                <Input name="recoveredIn" type="month" defaultValue={defaultRecoveryMonth} />
                <p className="text-xs text-muted-foreground">Leave for this month's payroll</p>
            </div>

            {msg && (
                <p className={`text-sm text-center p-2 rounded ${msg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {msg}
                </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isPending ? "Recording..." : "Record Entry"}
            </Button>
        </form>
    );
}

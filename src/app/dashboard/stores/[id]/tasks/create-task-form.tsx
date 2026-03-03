"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createStoreTask } from "@/actions/store-tasks";
import { useRouter } from "next/navigation";

export function CreateTaskForm({ storeId, employees }: { storeId: string; employees: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");
    const router = useRouter();

    const handle = (formData: FormData) => {
        formData.append("storeId", storeId);
        startTransition(async () => {
            const result = await createStoreTask(null, formData);
            setMsg(result.message);
            if (result.message.includes("success")) router.refresh();
        });
    };

    return (
        <form action={handle} className="space-y-4">
            <div className="space-y-1.5">
                <Label>Task Type *</Label>
                <select name="taskType" required className="w-full p-2 border rounded-md text-sm bg-white">
                    <option value="PLYWOOD_FITTING">Plywood Fitting</option>
                    <option value="PAINTING">Painting</option>
                    <option value="FINISHING">Finishing</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <div className="space-y-1.5">
                <Label>Description</Label>
                <Input name="description" placeholder="Brief details about the task" />
            </div>
            <div className="space-y-1.5">
                <Label>Assign To (Optional)</Label>
                <select name="assignedTo" className="w-full p-2 border rounded-md text-sm bg-white">
                    <option value="">Unassigned</option>
                    {employees.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>
                    ))}
                </select>
            </div>
            {msg && (
                <p className={`text-sm text-center p-2 rounded ${msg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {msg}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isPending ? "Creating..." : "Create Task"}
            </Button>
        </form>
    );
}

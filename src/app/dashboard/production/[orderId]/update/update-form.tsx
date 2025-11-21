"use client";

import { useState, useTransition } from "react";
import { updateProductionStage } from "@/actions/production";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductionStage } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface FormState {
    message: string;
}

const initialState: FormState = {
    message: "",
};

const stageColors: Record<ProductionStage, string> = {
    PENDING: "bg-slate-100 text-slate-800",
    CUTTING: "bg-orange-100 text-orange-800",
    SHAPING: "bg-amber-100 text-amber-800",
    BENDING: "bg-yellow-100 text-yellow-800",
    WELDING_INNER: "bg-lime-100 text-lime-800",
    WELDING_OUTER: "bg-emerald-100 text-emerald-800",
    GRINDING: "bg-zinc-100 text-zinc-800",
    FINISHING: "bg-cyan-100 text-cyan-800",
    PAINTING: "bg-sky-100 text-sky-800",
    COMPLETED: "bg-green-100 text-green-800",
};

const stages: ProductionStage[] = [
    ProductionStage.PENDING,
    ProductionStage.CUTTING,
    ProductionStage.SHAPING,
    ProductionStage.BENDING,
    ProductionStage.WELDING_INNER,
    ProductionStage.WELDING_OUTER,
    ProductionStage.GRINDING,
    ProductionStage.FINISHING,
    ProductionStage.PAINTING,
    ProductionStage.COMPLETED,
];

export default function UpdateStageForm({ order, employees }: { order: any; employees: any[] }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();

    const currentStageIndex = stages.indexOf(order.currentStage);
    const nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;

    const handleSubmit = (formData: FormData) => {
        formData.append("orderId", order.id);

        startTransition(async () => {
            const result = await updateProductionStage(state, formData);
            setState(result as FormState);

            if (result.message.includes("successfully")) {
                setTimeout(() => {
                    router.push("/dashboard/production");
                }, 1000);
            }
        });
    };

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/production">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Stage</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge className={`${stageColors[order.currentStage as ProductionStage]} px-4 py-2 text-base`}>
                        {order.currentStage.replace('_', ' ')}
                    </Badge>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Update to Next Stage</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="stage">New Stage *</Label>
                            <Select name="stage" defaultValue={nextStage || undefined} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((stage) => (
                                        <SelectItem
                                            key={stage}
                                            value={stage}
                                            disabled={stages.indexOf(stage) <= currentStageIndex}
                                        >
                                            {stage.replace('_', ' ')}
                                            {stages.indexOf(stage) <= currentStageIndex && " (Already completed)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Assign Employee (Optional)</Label>
                            <Select name="employeeId">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                            {employee.name} ({employee.designation})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue="Completed">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                    <SelectItem value="Quality Check">Quality Check</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes / Comments</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Add any notes about this stage..."
                                rows={4}
                            />
                        </div>

                        {state?.message && (
                            <div className={`p-3 rounded-md text-sm text-center ${state.message.includes("successfully")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}>
                                {state.message}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Update Stage
                                    </>
                                )}
                            </Button>
                            <Link href="/dashboard/production">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

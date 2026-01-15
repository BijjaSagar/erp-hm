"use client";

import { useState, useTransition } from "react";
import { startProductionEntry } from "@/actions/production-entry";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface FormState {
    message: string;
    entryId?: string;
}

const initialState: FormState = {
    message: "",
};

export default function StartProductionForm({ order, machines, employees }: { order: any; machines: any[]; employees: any[] }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();
    const [selectedMachine, setSelectedMachine] = useState("");
    const [selectedOperator, setSelectedOperator] = useState("");

    const handleSubmit = (formData: FormData) => {
        formData.append("orderId", order.id);
        formData.append("stage", order.currentStage);

        startTransition(async () => {
            const result = await startProductionEntry(state, formData);
            setState(result as FormState);

            if (result.message.includes("successfully")) {
                setTimeout(() => {
                    router.push(`/dashboard/production/${order.id}/entry/${result.entryId}`);
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

            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Order Number</div>
                            <div className="font-medium">{order.orderNumber}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Customer</div>
                            <div className="font-medium">{order.customerName}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Current Stage</div>
                            <Badge variant="outline">{order.currentStage.replace('_', ' ')}</Badge>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total Items</div>
                            <div className="font-medium">{order.items.length}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Production Entry Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Start Production Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        {/* Machine Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="machineId">Select Machine *</Label>
                            <Select
                                name="machineId"
                                value={selectedMachine}
                                onValueChange={setSelectedMachine}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a machine" />
                                </SelectTrigger>
                                <SelectContent>
                                    {machines.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">
                                            No machines available for this stage
                                        </div>
                                    ) : (
                                        machines.map((machine) => (
                                            <SelectItem key={machine.id} value={machine.id}>
                                                {machine.name} ({machine.code})
                                                {machine.capacity && ` - Capacity: ${machine.capacity}/hr`}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {machines.length === 0 && (
                                <p className="text-sm text-amber-600">
                                    ⚠️ No machines configured for {order.currentStage.replace('_', ' ')} stage
                                </p>
                            )}
                        </div>

                        {/* Operator Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="operatorId">Assign Operator *</Label>
                            <Select
                                name="operatorId"
                                value={selectedOperator}
                                onValueChange={setSelectedOperator}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                            {employee.name} ({employee.designation})
                                            {employee.department && ` - ${employee.department}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Input Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="inputQuantity">Input Quantity *</Label>
                            <Input
                                id="inputQuantity"
                                name="inputQuantity"
                                type="number"
                                min="1"
                                placeholder="Number of units to process"
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Enter the number of units you're starting to work on
                            </p>
                        </div>

                        {/* Information Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Timer will start automatically</li>
                                <li>• You can record material consumption during work</li>
                                <li>• Complete the entry when finished to record output and quality</li>
                                <li>• Entry will be sent for supervisor approval</li>
                            </ul>
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
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                                disabled={isPending || machines.length === 0}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Start Production
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

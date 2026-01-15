"use client";

import { useState, useTransition, useEffect } from "react";
import { completeProductionEntry } from "@/actions/production-entry";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, Clock, User, Cog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface FormState {
    message: string;
    orderId?: string;
}

const initialState: FormState = {
    message: "",
};

export default function CompleteProductionForm({ entry, materialConsumptions }: { entry: any; materialConsumptions: any[] }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();
    const [outputQuantity, setOutputQuantity] = useState("");
    const [rejectedQuantity, setRejectedQuantity] = useState("0");
    const [wastageQuantity, setWastageQuantity] = useState("0");
    const [elapsedTime, setElapsedTime] = useState("");

    // Calculate elapsed time
    useEffect(() => {
        const calculateElapsed = () => {
            const start = new Date(entry.startTime);
            const now = new Date();
            const diff = now.getTime() - start.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setElapsedTime(`${hours}h ${minutes}m`);
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [entry.startTime]);

    const handleSubmit = (formData: FormData) => {
        formData.append("entryId", entry.id);

        startTransition(async () => {
            const result = await completeProductionEntry(state, formData);
            setState(result as FormState);

            if (result.message.includes("successfully") && result.orderId) {
                setTimeout(() => {
                    router.push(`/dashboard/orders/${result.orderId}`);
                }, 1500);
            }
        });
    };

    // Calculate remaining quantity
    const output = parseInt(outputQuantity) || 0;
    const rejected = parseInt(rejectedQuantity) || 0;
    const remaining = entry.inputQuantity - output - rejected;

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/production">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Entry Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Production Entry Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-start space-x-3">
                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Started</div>
                                <div className="font-medium">{new Date(entry.startTime).toLocaleString()}</div>
                                <div className="text-sm text-blue-600 font-semibold mt-1">
                                    Elapsed: {elapsedTime}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Cog className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Machine</div>
                                <div className="font-medium">{entry.machine.name}</div>
                                <div className="text-sm text-muted-foreground">{entry.machine.code}</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <User className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Operator</div>
                                <div className="font-medium">{entry.operator.name}</div>
                                <div className="text-sm text-muted-foreground">{entry.operator.designation}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Input Quantity</div>
                            <div className="text-2xl font-bold text-slate-900">{entry.inputQuantity}</div>
                            <div className="text-sm text-muted-foreground">units</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Material Consumption Summary */}
            {materialConsumptions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Materials Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {materialConsumptions.map((consumption) => (
                                <div key={consumption.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                    <div>
                                        <div className="font-medium">{consumption.material.name}</div>
                                        <div className="text-sm text-muted-foreground">{consumption.materialType}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{consumption.quantity} {consumption.unit}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Complete Entry Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Record Output & Quality</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        {/* Output Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="outputQuantity">Output Quantity (Good Units) *</Label>
                            <Input
                                id="outputQuantity"
                                name="outputQuantity"
                                type="number"
                                min="0"
                                max={entry.inputQuantity}
                                value={outputQuantity}
                                onChange={(e) => setOutputQuantity(e.target.value)}
                                placeholder="Number of good units produced"
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Successfully produced units that passed quality check
                            </p>
                        </div>

                        {/* Rejected Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="rejectedQuantity">Rejected Quantity (Defective Units)</Label>
                            <Input
                                id="rejectedQuantity"
                                name="rejectedQuantity"
                                type="number"
                                min="0"
                                max={entry.inputQuantity}
                                value={rejectedQuantity}
                                onChange={(e) => setRejectedQuantity(e.target.value)}
                                placeholder="Number of defective units"
                            />
                            <p className="text-sm text-muted-foreground">
                                Units that failed quality check or were damaged
                            </p>
                        </div>

                        {/* Wastage Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="wastageQuantity">Wastage Quantity (Material Scrap)</Label>
                            <Input
                                id="wastageQuantity"
                                name="wastageQuantity"
                                type="number"
                                min="0"
                                step="0.01"
                                value={wastageQuantity}
                                onChange={(e) => setWastageQuantity(e.target.value)}
                                placeholder="Amount of material wasted"
                            />
                            <p className="text-sm text-muted-foreground">
                                Scrap material or waste generated (in kg or units)
                            </p>
                        </div>

                        {/* Calculation Summary */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <h4 className="font-semibold text-slate-900 mb-3">Summary</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Input:</span>
                                    <span className="font-semibold">{entry.inputQuantity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Output:</span>
                                    <span className="font-semibold text-green-600">{output}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rejected:</span>
                                    <span className="font-semibold text-red-600">{rejected}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Remaining:</span>
                                    <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                        {remaining}
                                    </span>
                                </div>
                            </div>
                            {remaining < 0 && (
                                <p className="text-sm text-red-600 mt-2">
                                    ⚠️ Output + Rejected cannot exceed Input quantity
                                </p>
                            )}
                            {output > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Efficiency:</span>
                                        <span className="font-bold text-blue-600">
                                            {Math.round((output / entry.inputQuantity) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quality Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="qualityNotes">Quality Notes / Comments</Label>
                            <Textarea
                                id="qualityNotes"
                                name="qualityNotes"
                                placeholder="Add any quality observations, issues encountered, or special notes..."
                                rows={4}
                            />
                        </div>

                        {/* Information Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">After Completion</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Production entry will be marked as complete</li>
                                <li>• Entry will be sent to supervisor for quality approval</li>
                                <li>• Once approved, order will move to next stage</li>
                                <li>• All data will be recorded for reporting and analytics</li>
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
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                disabled={isPending || remaining < 0}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Complete Entry
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

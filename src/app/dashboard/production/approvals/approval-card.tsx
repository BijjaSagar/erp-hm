"use client";

import { useState } from "react";
import { approveProductionEntry } from "@/actions/production-entry";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, User, Cog, Package, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ApprovalCard({ entry }: { entry: any }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);
    const [notes, setNotes] = useState("");
    const [isApproving, setIsApproving] = useState(false);

    const handleApprove = async () => {
        if (!session?.user?.id) return;

        setIsApproving(true);
        const result = await approveProductionEntry(entry.id, session.user.id, notes);

        if (result.message.includes("successfully")) {
            router.refresh();
        } else {
            alert(result.message);
            setIsApproving(false);
        }
    };

    const efficiency = entry.inputQuantity > 0
        ? Math.round((entry.outputQuantity / entry.inputQuantity) * 100)
        : 0;

    const rejectionRate = entry.inputQuantity > 0
        ? Math.round((entry.rejectedQuantity / entry.inputQuantity) * 100)
        : 0;

    const duration = entry.duration ? `${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m` : "N/A";

    return (
        <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                                {entry.order.orderNumber}
                            </h3>
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                                {entry.stage.replace('_', ' ')}
                            </Badge>
                            {rejectionRate > 10 && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    High Rejection
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {entry.order.customerName}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-semibold">{duration}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">Operator</p>
                            <p className="font-semibold text-sm">{entry.operator.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Cog className="h-4 w-4 text-purple-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">Machine</p>
                            <p className="font-semibold text-sm">{entry.machine.code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-amber-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="font-semibold text-sm">
                                {new Date(entry.endTime).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Production Metrics */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Input</p>
                            <p className="text-2xl font-bold text-slate-900">{entry.inputQuantity}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Output</p>
                            <p className="text-2xl font-bold text-green-600">{entry.outputQuantity}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{entry.rejectedQuantity}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                            <p className={`text-2xl font-bold ${efficiency >= 90 ? 'text-green-600' : efficiency >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                                {efficiency}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="space-y-4 border-t pt-4">
                        {/* Quality Notes */}
                        {entry.qualityNotes && (
                            <div>
                                <p className="text-sm font-semibold mb-1">Quality Notes:</p>
                                <p className="text-sm text-muted-foreground bg-white p-3 rounded border">
                                    {entry.qualityNotes}
                                </p>
                            </div>
                        )}

                        {/* Material Consumption */}
                        {entry.materialConsumptions && entry.materialConsumptions.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold mb-2">Materials Used:</p>
                                <div className="space-y-2">
                                    {entry.materialConsumptions.map((consumption: any) => (
                                        <div key={consumption.id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                            <span>{consumption.material.name}</span>
                                            <span className="font-semibold">
                                                {consumption.quantity} {consumption.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wastage */}
                        {entry.wastageQuantity > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-3">
                                <p className="text-sm font-semibold text-amber-900">
                                    Wastage: {entry.wastageQuantity} ({entry.wastagePercentage?.toFixed(2)}%)
                                </p>
                            </div>
                        )}

                        {/* Approval Notes */}
                        <div>
                            <label className="text-sm font-semibold mb-2 block">
                                Approval Notes (Optional):
                            </label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any comments or observations..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                    <Button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    >
                        {isApproving ? (
                            <>Approving...</>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve & Move to Next Stage
                            </>
                        )}
                    </Button>
                    {!isExpanded && (
                        <Button
                            variant="outline"
                            onClick={() => setIsExpanded(true)}
                        >
                            View Details
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Box } from 'lucide-react';
import { approveProductionEntry, rejectProductionEntry } from './actions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';

interface ApprovalListProps {
    entries: any[];
}

export function ApprovalList({ entries }: ApprovalListProps) {
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = (entry: any, type: 'approve' | 'reject') => {
        setSelectedEntry(entry);
        setActionType(type);
        setNotes('');
    };

    const confirmAction = async () => {
        if (!selectedEntry || !actionType) return;

        setLoading(true);
        try {
            if (actionType === 'approve') {
                await approveProductionEntry(selectedEntry.id, notes);
            } else {
                await rejectProductionEntry(selectedEntry.id, notes);
            }
            setSelectedEntry(null);
            setActionType(null);
        } catch (error) {
            console.error("Action failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (entries.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No pending approvals found.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {entries.map((entry) => (
                <Card key={entry.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg font-medium">
                                    {entry.order.orderNumber} - {entry.stage}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Machine: {entry.machine.name}
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending Review
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <User className="h-3 w-3 mr-1" /> Operator
                                </p>
                                <p className="font-medium">{entry.operator.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" /> Duration
                                </p>
                                <p className="font-medium">
                                    {entry.duration} mins
                                    <span className="text-xs text-muted-foreground ml-1">
                                        ({format(new Date(entry.startTime), 'HH:mm')} - {format(new Date(entry.endTime), 'HH:mm')})
                                    </span>
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <Box className="h-3 w-3 mr-1" /> Output
                                </p>
                                <div className="flex gap-2 text-sm">
                                    <span className="text-green-600 font-medium">{entry.outputQuantity} Good</span>
                                    <span className="text-red-600">{entry.rejectedQuantity} Rej</span>
                                    <span className="text-orange-600">{entry.wastageQuantity} Scrap</span>
                                </div>
                            </div>
                        </div>

                        {entry.materialConsumptions.length > 0 && (
                            <div className="mb-4 p-3 bg-slate-50 rounded-md text-sm">
                                <p className="font-medium mb-2">Materials Used:</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {entry.materialConsumptions.map((mc: any) => (
                                        <li key={mc.id}>
                                            {mc.material.name}: {mc.quantity} {mc.unit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleAction(entry, 'reject')}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(entry, 'approve')}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Approve Production Entry' : 'Reject Production Entry'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve'
                                ? 'Confirm quality approval for this production session.'
                                : 'Please provide a reason for rejection.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Label htmlFor="notes" className="mb-2 block">
                            {actionType === 'approve' ? 'Quality Notes (Optional)' : 'Rejection Reason (Required)'}
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={actionType === 'approve' ? "Good quality..." : "Defects found in..."}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedEntry(null)}>Cancel</Button>
                        <Button
                            onClick={confirmAction}
                            disabled={loading || (actionType === 'reject' && !notes)}
                            variant={actionType === 'reject' ? 'destructive' : 'default'}
                        >
                            {loading ? 'Processing...' : (actionType === 'approve' ? 'Confirm Approval' : 'Reject Entry')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { createLeaveRequest } from './leave-actions';
import { useRouter } from 'next/navigation';
import { LeaveType } from '@prisma/client';

export function LeaveRequestForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [leaveType, setLeaveType] = useState<LeaveType | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!leaveType || !startDate || !endDate || !reason) {
            setError("Please fill in all fields");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            setError("End date must be after start date");
            return;
        }

        setError(null);
        startTransition(async () => {
            try {
                const result = await createLeaveRequest({
                    leaveType: leaveType as LeaveType,
                    startDate: start,
                    endDate: end,
                    reason
                });

                if (result.error) {
                    setError(result.error);
                } else {
                    setSuccess(true);
                    // Reset form
                    setLeaveType('');
                    setStartDate('');
                    setEndDate('');
                    setReason('');
                    setTimeout(() => {
                        setSuccess(false);
                        router.refresh();
                    }, 2000);
                }
            } catch (e) {
                setError("Failed to submit leave request");
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Leave</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
                            Leave request submitted successfully!
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="leaveType">Leave Type</Label>
                        <Select onValueChange={(value) => setLeaveType(value as LeaveType)} value={leaveType}>
                            <SelectTrigger id="leaveType">
                                <SelectValue placeholder="Select leave type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASUAL">Casual Leave</SelectItem>
                                <SelectItem value="SICK">Sick Leave</SelectItem>
                                <SelectItem value="EARNED">Earned Leave</SelectItem>
                                <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <div className="relative">
                                <input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <div className="relative">
                                <input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a reason for your leave request..."
                            rows={4}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Leave Request"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

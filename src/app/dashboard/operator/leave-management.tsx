"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Calendar,
    Check,
    X,
    User,
    Clock,
    MessageSquare
} from "lucide-react";
import { approveLeaveRequest, rejectLeaveRequest } from "./actions";
import { useRouter } from "next/navigation";

interface LeaveRequest {
    id: string;
    employeeId: string;
    startDate: Date;
    endDate: Date;
    reason: string | null;
    status: string;
    createdAt: Date;
    employee: {
        id: string;
        name: string;
        designation: string;
        phone: string | null;
    };
}

interface LeaveManagementProps {
    leaveRequests: LeaveRequest[];
    adminId: string;
}

export function LeaveManagement({ leaveRequests, adminId }: LeaveManagementProps) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = async (requestId: string) => {
        setProcessingId(requestId);
        try {
            const result = await approveLeaveRequest(requestId, adminId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to approve leave request");
            }
        } catch (error) {
            alert("An error occurred while approving the request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        setProcessingId(requestId);
        try {
            const result = await rejectLeaveRequest(requestId, adminId, rejectionReason);
            if (result.success) {
                setRejectingId(null);
                setRejectionReason("");
                router.refresh();
            } else {
                alert(result.error || "Failed to reject leave request");
            }
        } catch (error) {
            alert("An error occurred while rejecting the request");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysDifference = (start: Date, end: Date) => {
        const diffTime = new Date(end).getTime() - new Date(start).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <div className="space-y-4">
            {leaveRequests && leaveRequests.length > 0 ? (
                leaveRequests.map((request) => (
                    <Card key={request.id} className="hover-lift">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                {/* Employee Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
                                            {request.employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">{request.employee.name}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                {request.employee.designation}
                                                {request.employee.phone && (
                                                    <>
                                                        <span>•</span>
                                                        {request.employee.phone}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Leave Dates */}
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground">Leave Period</div>
                                            <div className="font-medium">
                                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {getDaysDifference(request.startDate, request.endDate)} day(s)
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    {request.reason && (
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <div className="text-sm font-medium text-muted-foreground">Reason</div>
                                                    <p className="text-sm mt-1">{request.reason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Request Date */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        Requested {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    {rejectingId === request.id ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                placeholder="Reason for rejection..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={processingId === request.id}
                                                    className="flex-1"
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setRejectingId(null);
                                                        setRejectionReason("");
                                                    }}
                                                    disabled={processingId === request.id}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                                onClick={() => handleApprove(request.id)}
                                                disabled={processingId === request.id}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                                onClick={() => setRejectingId(request.id)}
                                                disabled={processingId === request.id}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No pending leave requests</p>
                        <p className="text-sm text-muted-foreground">All leave requests have been processed</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    User,
    Clock,
    Coffee,
    Wrench,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import { ProductionStage } from "@prisma/client";

type OperatorStatus = {
    employeeId: string;
    name: string;
    designation: string;
    phone: string | null;
    branchId: string;
    assignedStages: ProductionStage[];
    status: 'working' | 'on_break' | 'absent' | 'checked_in';
    attendance: {
        checkIn: Date;
        checkOut: Date | null;
        status: string;
    } | null;
    currentWork: {
        machine: string;
        machineCode: string;
        orderNumber: string;
        stage: ProductionStage;
        startTime: Date;
    } | null;
    onBreak: {
        startTime: Date;
        reason: string | null;
    } | null;
};

interface AdminOperatorOverviewProps {
    operators: OperatorStatus[];
}

export function AdminOperatorOverview({ operators }: AdminOperatorOverviewProps) {
    const getStatusColor = (status: OperatorStatus['status']) => {
        switch (status) {
            case 'working':
                return 'bg-gradient-to-r from-green-500 to-emerald-500';
            case 'on_break':
                return 'bg-gradient-to-r from-orange-500 to-amber-500';
            case 'checked_in':
                return 'bg-gradient-to-r from-blue-500 to-cyan-500';
            case 'absent':
                return 'bg-gradient-to-r from-red-500 to-rose-500';
        }
    };

    const getStatusIcon = (status: OperatorStatus['status']) => {
        switch (status) {
            case 'working':
                return <Wrench className="h-4 w-4" />;
            case 'on_break':
                return <Coffee className="h-4 w-4" />;
            case 'checked_in':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'absent':
                return <XCircle className="h-4 w-4" />;
        }
    };

    const getStatusLabel = (status: OperatorStatus['status']) => {
        switch (status) {
            case 'working':
                return 'Working';
            case 'on_break':
                return 'On Break';
            case 'checked_in':
                return 'Checked In';
            case 'absent':
                return 'Absent';
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getWorkDuration = (startTime: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(startTime).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    // Group operators by status
    const statusCounts = {
        working: operators.filter(o => o.status === 'working').length,
        on_break: operators.filter(o => o.status === 'on_break').length,
        checked_in: operators.filter(o => o.status === 'checked_in').length,
        absent: operators.filter(o => o.status === 'absent').length
    };

    return (
        <div className="space-y-6">
            {/* Status Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Working
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{statusCounts.working}</div>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                            <Coffee className="h-4 w-4" />
                            On Break
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">{statusCounts.on_break}</div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Checked In
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{statusCounts.checked_in}</div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Absent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-900">{statusCounts.absent}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Operators Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {operators.map((operator) => (
                    <Card key={operator.employeeId} className="hover-lift">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                                            {operator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{operator.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{operator.designation}</p>
                                    </div>
                                </div>
                                <Badge className={`${getStatusColor(operator.status)} text-white border-0 flex items-center gap-1`}>
                                    {getStatusIcon(operator.status)}
                                    {getStatusLabel(operator.status)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Attendance Info */}
                            {operator.attendance && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Check-in:</span>
                                    <span className="font-medium">{formatTime(operator.attendance.checkIn)}</span>
                                </div>
                            )}

                            {/* Current Work */}
                            {operator.currentWork && (
                                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-900">Current Task</span>
                                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                            {getWorkDuration(operator.currentWork.startTime)}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Order:</span>
                                            <span className="font-medium">{operator.currentWork.orderNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Machine:</span>
                                            <span className="font-medium">{operator.currentWork.machineCode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Stage:</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {operator.currentWork.stage}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* On Break Info */}
                            {operator.onBreak && (
                                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Coffee className="h-4 w-4 text-orange-600" />
                                        <span className="font-medium text-orange-900">
                                            Break started {formatTime(operator.onBreak.startTime)}
                                        </span>
                                    </div>
                                    {operator.onBreak.reason && (
                                        <p className="text-xs text-orange-700 mt-1">{operator.onBreak.reason}</p>
                                    )}
                                </div>
                            )}

                            {/* Assigned Stages */}
                            {operator.assignedStages.length > 0 && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground mb-2">Assigned Stages:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {operator.assignedStages.map((stage) => (
                                            <Badge key={stage} variant="outline" className="text-xs">
                                                {stage}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {operators.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No operators found</p>
                        <p className="text-sm text-muted-foreground">There are no operators in the system yet.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

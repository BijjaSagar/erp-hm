"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    Award,
    AlertTriangle,
    Clock,
    Target,
    BarChart3
} from "lucide-react";

interface OperatorAnalyticsProps {
    analytics: {
        topPerformers: Array<{
            employeeId: string;
            name: string;
            ordersCompleted: number;
            efficiency: number;
            qualityScore: number;
        }>;
        productivityTrends: Array<{
            date: string;
            ordersCompleted: number;
            avgCompletionTime: number;
        }>;
        wastageStats: Array<{
            employeeId: string;
            name: string;
            wastagePercentage: number;
            totalWastage: number;
        }>;
        attendanceStats: {
            onTime: number;
            late: number;
            absent: number;
            averageHours: number;
        };
    };
}

export function OperatorAnalytics({ analytics }: OperatorAnalyticsProps) {
    const { topPerformers, wastageStats, attendanceStats } = analytics;

    return (
        <div className="space-y-6">
            {/* Performance Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            On-Time Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">
                            {attendanceStats?.onTime || 0}%
                        </div>
                        <p className="text-xs text-green-700 mt-1">This month</p>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Avg Work Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">
                            {attendanceStats?.averageHours?.toFixed(1) || 0}h
                        </div>
                        <p className="text-xs text-blue-700 mt-1">Per day</p>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Top Performers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">
                            {topPerformers?.length || 0}
                        </div>
                        <p className="text-xs text-purple-700 mt-1">Above 90% efficiency</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            High Wastage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">
                            {wastageStats?.filter(w => w.wastagePercentage > 5).length || 0}
                        </div>
                        <p className="text-xs text-orange-700 mt-1">Above 5% threshold</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        Top Performers This Month
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topPerformers && topPerformers.length > 0 ? (
                            topPerformers.slice(0, 5).map((performer, index) => (
                                <div key={performer.employeeId} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{performer.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {performer.ordersCompleted} orders completed
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Efficiency</div>
                                            <div className="font-bold text-purple-900">{performer.efficiency}%</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Quality</div>
                                            <div className="font-bold text-green-900">{performer.qualityScore}%</div>
                                        </div>
                                        {performer.efficiency >= 95 && (
                                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                                <Award className="h-3 w-3 mr-1" />
                                                Star
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No performance data available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Wastage Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Wastage Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {wastageStats && wastageStats.length > 0 ? (
                            wastageStats
                                .sort((a, b) => b.wastagePercentage - a.wastagePercentage)
                                .slice(0, 10)
                                .map((stat) => (
                                    <div key={stat.employeeId} className="flex items-center justify-between p-3 rounded-lg border hover:border-orange-300 transition-colors">
                                        <div className="flex-1">
                                            <div className="font-medium">{stat.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Total wastage: {stat.totalWastage.toFixed(2)} kg
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${stat.wastagePercentage > 5
                                                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min(stat.wastagePercentage * 10, 100)}%` }}
                                                />
                                            </div>
                                            <Badge
                                                variant={stat.wastagePercentage > 5 ? "destructive" : "secondary"}
                                                className="w-16 justify-center"
                                            >
                                                {stat.wastagePercentage.toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No wastage data available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            On Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceStats?.onTime || 0}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Punctual arrivals</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            Late Arrivals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceStats?.late || 0}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Delayed check-ins</p>
                    </CardContent>
                </Card>

                <Card className="border-red-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            Absences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceStats?.absent || 0}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Unplanned absences</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

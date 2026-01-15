export const dynamic = 'force-dynamic';

import { getPendingApprovals, getProductionEntryStats } from "@/actions/production-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import ApprovalCard from "./approval-card";

export default async function ProductionApprovalsPage() {
    const [pendingApprovals, stats] = await Promise.all([
        getPendingApprovals(),
        getProductionEntryStats(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Production Approvals
                </h2>
                <p className="text-muted-foreground">
                    Review and approve completed production entries
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                                <p className="text-3xl font-bold text-amber-600">{stats.pendingApprovals}</p>
                            </div>
                            <AlertCircle className="h-10 w-10 text-amber-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Entries</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.activeEntries}</p>
                            </div>
                            <Clock className="h-10 w-10 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Approved Today</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approvedToday}</p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Entries</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.totalEntries}</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-slate-900 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Approvals List */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals ({pendingApprovals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingApprovals.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                All Caught Up!
                            </h3>
                            <p className="text-muted-foreground">
                                No pending approvals at the moment
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingApprovals.map((entry) => (
                                <ApprovalCard key={entry.id} entry={entry} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

import { getMachineHistory } from "./machine-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export async function MachineStatusList() {
    const { machineHistory, error } = await getMachineHistory();

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPERATIONAL':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'STUCK':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'MAINTENANCE':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'BREAKDOWN':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'HIGH':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStageLabel = (stage: string) => {
        return stage.split('_').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Calculate statistics
    const totalReports = machineHistory?.length || 0;
    const resolvedReports = machineHistory?.filter(r => r.resolvedAt).length || 0;
    const pendingReports = totalReports - resolvedReports;
    const criticalReports = machineHistory?.filter(r => r.priority === 'CRITICAL' && !r.resolvedAt).length || 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReports}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{pendingReports}</div>
                        <p className="text-xs text-muted-foreground">Awaiting resolution</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{resolvedReports}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0}% resolved
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{criticalReports}</div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Machine Status Reports */}
            <Card>
                <CardHeader>
                    <CardTitle>Machine Issue Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {machineHistory && machineHistory.length > 0 ? (
                            machineHistory.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Wrench className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-lg">{report.machineName}</span>
                                            <Badge className={getStatusColor(report.status)}>
                                                {report.status}
                                            </Badge>
                                            <Badge className={getPriorityColor(report.priority)}>
                                                {report.priority}
                                            </Badge>
                                            {report.resolvedAt && (
                                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                                    Resolved
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Stage:</span>
                                                <span className="font-medium">
                                                    {getStageLabel(report.stage)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">Reported:</span>
                                                <span className="font-medium">
                                                    {format(new Date(report.reportedAt), "MMM d, yyyy h:mm a")}
                                                </span>
                                            </div>
                                            {report.resolvedAt && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                    <span className="text-muted-foreground">Resolved:</span>
                                                    <span className="font-medium text-green-600">
                                                        {format(new Date(report.resolvedAt), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {report.issue && (
                                            <div className="text-sm text-muted-foreground mb-2">
                                                <span className="font-medium">Issue:</span> {report.issue}
                                            </div>
                                        )}
                                        {report.resolver && (
                                            <div className="text-xs text-muted-foreground">
                                                Resolved by: {report.resolver.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No machine issue reports found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

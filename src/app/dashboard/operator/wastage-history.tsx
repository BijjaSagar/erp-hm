import { getWastageLogs } from "./wastage-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, Calendar } from "lucide-react";
import { format } from "date-fns";

export async function WastageHistoryView() {
    const { wastageLogs, error } = await getWastageLogs();

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    // Calculate statistics
    const totalWastage = wastageLogs?.length || 0;
    const wastageByStage = wastageLogs?.reduce((acc, log) => {
        acc[log.stage] = (acc[log.stage] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const topStage = Object.entries(wastageByStage).sort((a, b) => b[1] - a[1])[0];

    const getStageLabel = (stage: string) => {
        return stage.split('_').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const getStageColor = (stage: string) => {
        const colors: Record<string, string> = {
            'CUTTING': 'bg-blue-100 text-blue-800 border-blue-200',
            'SHAPING': 'bg-purple-100 text-purple-800 border-purple-200',
            'BENDING': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'WELDING_INNER': 'bg-orange-100 text-orange-800 border-orange-200',
            'WELDING_OUTER': 'bg-red-100 text-red-800 border-red-200',
            'GRINDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'FINISHING': 'bg-green-100 text-green-800 border-green-200',
            'PAINTING': 'bg-pink-100 text-pink-800 border-pink-200',
        };
        return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Wastage Logs</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{totalWastage}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Wastage Stage</CardTitle>
                        <Package className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {topStage ? getStageLabel(topStage[0]) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {topStage ? `${topStage[1]} logs` : 'No data'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {wastageLogs?.filter(log => {
                                const logDate = new Date(log.timestamp);
                                const now = new Date();
                                return logDate.getMonth() === now.getMonth() &&
                                    logDate.getFullYear() === now.getFullYear();
                            }).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Wastage logs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Wastage Logs */}
            <Card>
                <CardHeader>
                    <CardTitle>Wastage History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {wastageLogs && wastageLogs.length > 0 ? (
                            wastageLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                            <span className="font-medium text-lg">{log.materialName}</span>
                                            <Badge className={getStageColor(log.stage)}>
                                                {getStageLabel(log.stage)}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-2">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <span className="font-medium">
                                                    {log.quantity} {log.unit}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">Date:</span>
                                                <span className="font-medium">
                                                    {format(new Date(log.timestamp), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                            {log.order && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">Order:</span>
                                                    <span className="font-medium">
                                                        {log.order.orderNumber}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-medium">Reason:</span> {log.reason}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No wastage logs found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

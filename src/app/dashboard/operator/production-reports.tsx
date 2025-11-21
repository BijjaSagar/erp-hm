import { getProductionReports } from "./report-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Clock, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export async function ProductionReports() {
    const { stats, productionEntries, byStage, materialsByType, error } = await getProductionReports(30);

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

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
            {/* Overview Stats */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.completedSessions} completed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Output</CardTitle>
                            <Package className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalOutput}</div>
                            <p className="text-xs text-muted-foreground">Units produced</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Working Hours</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.avgEfficiency}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalWastage} wastage, {stats.totalRejected} rejected
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Production by Stage */}
            {byStage && Object.keys(byStage).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Production by Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(byStage).map(([stage, data]: [string, any]) => (
                                <div key={stage} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge className={getStageColor(stage)}>
                                            {getStageLabel(stage)}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {data.count} sessions
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                            <span className="font-medium text-green-600">{data.output}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-orange-600" />
                                            <span className="font-medium text-orange-600">{data.wastage}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">Rejected:</span>
                                            <span className="font-medium text-red-600">{data.rejected}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Material Consumption */}
            {materialsByType && Object.keys(materialsByType).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Material Consumption (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(materialsByType).map(([material, data]: [string, any]) => (
                                <div key={material} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{material}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-blue-600">{data.quantity.toFixed(2)}</span>
                                        <span className="text-muted-foreground ml-1">{data.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Production Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Production Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {productionEntries && productionEntries.length > 0 ? (
                            productionEntries.slice(0, 10).map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-medium">{entry.machine.name}</span>
                                            <Badge className={getStageColor(entry.stage)}>
                                                {getStageLabel(entry.stage)}
                                            </Badge>
                                            {entry.endTime && (
                                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                                    Completed
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Order:</span>
                                                <span className="font-medium ml-1">{entry.order.orderNumber}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Output:</span>
                                                <span className="font-medium text-green-600 ml-1">{entry.outputQuantity}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span className="font-medium ml-1">
                                                    {entry.duration ? `${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m` : 'In progress'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Date:</span>
                                                <span className="font-medium ml-1">
                                                    {format(new Date(entry.startTime), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No production sessions found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

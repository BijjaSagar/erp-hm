import { getBreakHistory } from "./break-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

export async function BreakHistoryView() {
    const { breaks, totalBreakTime, error } = await getBreakHistory();

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return "In Progress";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    // Calculate statistics
    const completedBreaks = breaks?.filter(b => b.duration) || [];
    const avgBreakDuration = completedBreaks.length > 0
        ? Math.round(completedBreaks.reduce((sum, b) => sum + (b.duration || 0), 0) / completedBreaks.length)
        : 0;

    const todayBreaks = breaks?.filter(b => {
        const breakDate = new Date(b.startTime);
        const today = new Date();
        return breakDate.toDateString() === today.toDateString();
    }) || [];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Breaks</CardTitle>
                        <Coffee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{breaks?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Breaks</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{todayBreaks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {todayBreaks.filter(b => !b.endTime).length > 0 ? "1 active" : "All completed"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatDuration(avgBreakDuration)}
                        </div>
                        <p className="text-xs text-muted-foreground">Per break</p>
                    </CardContent>
                </Card>
            </div>

            {/* Break Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Break History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {breaks && breaks.length > 0 ? (
                            breaks.map((breakRecord) => (
                                <div
                                    key={breakRecord.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Coffee className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {format(new Date(breakRecord.startTime), "EEEE, MMMM d, yyyy")}
                                            </span>
                                            {!breakRecord.endTime && (
                                                <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-green-600" />
                                                <span className="text-muted-foreground">Start:</span>
                                                <span className="font-medium">
                                                    {format(new Date(breakRecord.startTime), "h:mm a")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-red-600" />
                                                <span className="text-muted-foreground">End:</span>
                                                <span className="font-medium">
                                                    {breakRecord.endTime
                                                        ? format(new Date(breakRecord.endTime), "h:mm a")
                                                        : "In progress"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-blue-600" />
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span className="font-medium">
                                                    {formatDuration(breakRecord.duration)}
                                                </span>
                                            </div>
                                        </div>
                                        {breakRecord.reason && (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <span className="font-medium">Reason:</span> {breakRecord.reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No break records found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

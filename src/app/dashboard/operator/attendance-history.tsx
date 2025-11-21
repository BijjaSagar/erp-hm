import { getAttendanceHistory, getAttendanceStats } from "./attendance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export async function AttendanceHistory() {
    const { attendance, error } = await getAttendanceHistory(30);
    const { stats } = await getAttendanceStats();

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const formatDuration = (checkIn: Date, checkOut: Date | null) => {
        if (!checkOut) return "In Progress";
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDays}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Present</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}% attendance
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                            <Clock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.lateDays}</div>
                            <p className="text-xs text-muted-foreground">After 9:15 AM</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.avgHours}</div>
                            <p className="text-xs text-muted-foreground">Per day</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Attendance Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {attendance && attendance.length > 0 ? (
                            attendance.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {format(new Date(record.date), "EEEE, MMMM d, yyyy")}
                                            </span>
                                            <Badge
                                                variant={record.status === "PRESENT" ? "default" : "secondary"}
                                                className={
                                                    record.status === "PRESENT"
                                                        ? "bg-green-100 text-green-800 border-green-200"
                                                        : ""
                                                }
                                            >
                                                {record.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-green-600" />
                                                <span className="text-muted-foreground">Check In:</span>
                                                <span className="font-medium">
                                                    {format(new Date(record.checkIn), "h:mm a")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-red-600" />
                                                <span className="text-muted-foreground">Check Out:</span>
                                                <span className="font-medium">
                                                    {record.checkOut
                                                        ? format(new Date(record.checkOut), "h:mm a")
                                                        : "Not yet"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-blue-600" />
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span className="font-medium">
                                                    {formatDuration(record.checkIn, record.checkOut)}
                                                </span>
                                            </div>
                                        </div>
                                        {record.location && (
                                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{record.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No attendance records found for the last 30 days.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

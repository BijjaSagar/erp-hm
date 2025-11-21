import { getLeaveRequests, getLeaveBalance } from "./leave-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export async function LeaveHistoryView() {
    const { leaveRequests, error } = await getLeaveRequests();
    const { balance, taken } = await getLeaveBalance();

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return '';
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        switch (type) {
            case 'CASUAL':
                return 'Casual Leave';
            case 'SICK':
                return 'Sick Leave';
            case 'EARNED':
                return 'Earned Leave';
            case 'UNPAID':
                return 'Unpaid Leave';
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            {/* Leave Balance Cards */}
            {balance && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{balance.CASUAL}</div>
                            <p className="text-xs text-muted-foreground">
                                {taken?.CASUAL || 0} days used
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
                            <Calendar className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{balance.SICK}</div>
                            <p className="text-xs text-muted-foreground">
                                {taken?.SICK || 0} days used
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Earned Leave</CardTitle>
                            <Calendar className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{balance.EARNED}</div>
                            <p className="text-xs text-muted-foreground">
                                {taken?.EARNED || 0} days used
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
                            <FileText className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {leaveRequests?.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">All requests</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Leave Requests History */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Request History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {leaveRequests && leaveRequests.length > 0 ? (
                            leaveRequests.map((leave) => {
                                const days = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;
                                return (
                                    <div
                                        key={leave.id}
                                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-medium text-lg">
                                                    {getLeaveTypeLabel(leave.leaveType)}
                                                </span>
                                                <Badge className={getStatusColor(leave.status)}>
                                                    {leave.status}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">From:</span>
                                                    <span className="font-medium">
                                                        {format(new Date(leave.startDate), "MMM d, yyyy")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">To:</span>
                                                    <span className="font-medium">
                                                        {format(new Date(leave.endDate), "MMM d, yyyy")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm mb-2">
                                                <Clock className="h-3 w-3 text-blue-600" />
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span className="font-medium text-blue-600">
                                                    {days} {days === 1 ? 'day' : 'days'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <span className="font-medium">Reason:</span> {leave.reason}
                                            </div>
                                            {leave.approvedAt && (
                                                <div className="text-xs text-muted-foreground mt-2">
                                                    Approved on {format(new Date(leave.approvedAt), "MMM d, yyyy")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No leave requests found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

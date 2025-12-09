export const dynamic = 'force-dynamic';

import { getTodayAttendance } from "@/actions/attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckOutButton } from "./checkout-button";

export default async function AttendancePage() {
    const attendanceRecords = await getTodayAttendance();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Attendance</h2>
                <Link href="/dashboard/attendance/mark">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        Mark Attendance
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No attendance records for today.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attendanceRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.employee.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Clock className="mr-1 h-3 w-3 text-green-500" />
                                                {new Date(record.checkIn).toLocaleTimeString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {record.checkOut ? (
                                                <div className="flex items-center text-sm">
                                                    <Clock className="mr-1 h-3 w-3 text-red-500" />
                                                    {new Date(record.checkOut).toLocaleTimeString()}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">Active</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {record.location || "Unknown"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={record.checkOut ? "secondary" : "default"}>
                                                {record.checkOut ? "Completed" : "Present"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!record.checkOut && (
                                                <CheckOutButton attendanceId={record.id} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

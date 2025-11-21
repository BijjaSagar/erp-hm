import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function ProductionReportsPage() {
    const logs = await prisma.productionLog.findMany({
        include: {
            order: true,
            employee: true,
        },
        orderBy: {
            timestamp: 'desc',
        },
        take: 100, // Limit to last 100 logs for now
    });

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Production Reports</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Production Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Order #</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Operator</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        {format(log.timestamp, "PP p")}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {log.order.orderNumber}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.stage}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {log.employee?.name || "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {log.notes || "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No production logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

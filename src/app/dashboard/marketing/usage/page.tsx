import { getMaterialUsages } from "@/actions/material-usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, TrendingDown, Package, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function MaterialUsagePage() {
    const usages = await getMaterialUsages();

    const totalUsages = usages.length;
    const thisMonth = usages.filter(u =>
        new Date(u.usedAt).getMonth() === new Date().getMonth()
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Material Usage</h2>
                    <p className="text-muted-foreground">
                        Track raw material consumption
                    </p>
                </div>
                <Link href="/dashboard/marketing/usage/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Usage
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Usage Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsages}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{thisMonth}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usage History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {usages.map((usage) => (
                            <div key={usage.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{usage.material.name}</span>
                                        <Badge variant="outline">
                                            {usage.quantity} {usage.unit}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(usage.usedAt), "MMM dd, yyyy")}
                                        </div>
                                        {usage.usedFor && (
                                            <span>Purpose: {usage.usedFor}</span>
                                        )}
                                        {usage.usedBy && (
                                            <span>By: {usage.usedBy}</span>
                                        )}
                                    </div>
                                    {usage.notes && (
                                        <p className="text-sm text-muted-foreground">{usage.notes}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {usages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <TrendingDown className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No usage records yet</h3>
                            <p className="text-muted-foreground mb-4">Start tracking material consumption</p>
                            <Link href="/dashboard/marketing/usage/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Usage
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export default async function PLReportPage() {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT")) {
        redirect("/dashboard");
    }

    // Get all accounting entries
    const entries = await prisma.accountingEntry.findMany({
        orderBy: {
            date: "desc",
        },
    });

    // Calculate totals
    const revenue = entries
        .filter(e => e.entryType === "SALE")
        .reduce((sum, e) => sum + e.amount, 0);

    const expenses = entries
        .filter(e => e.entryType === "EXPENSE" || e.entryType === "PURCHASE")
        .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = revenue - expenses;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Profit & Loss Report
                </h2>
                <p className="text-muted-foreground mt-1">
                    View your profit and loss statement
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{revenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From sales
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₹{expenses.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Purchases & expenses
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{netProfit.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {netProfit >= 0 ? 'Profit' : 'Loss'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Report */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Breakdown</CardTitle>
                    <CardDescription>
                        All transactions contributing to P&L
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {entries.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No transactions found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{entry.description}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(entry.date).toLocaleDateString()} • {entry.entryType}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${entry.entryType === 'SALE' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {entry.entryType === 'SALE' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

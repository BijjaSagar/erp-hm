import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContraEntryForm } from "./contra-entry-form";
import { db } from "@/lib/db";

export default async function ContraEntryPage() {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STORE_MANAGER")) {
        redirect("/dashboard");
    }

    // Get all stores for the dropdown
    const stores = await db.store.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    // Get recent contra entries
    const recentEntries = await db.accountingEntry.findMany({
        where: {
            entryType: "TRANSFER",
            description: {
                contains: "Contra Entry",
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Contra Entry
                </h2>
                <p className="text-muted-foreground mt-1">
                    Record banking cheque transactions
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contra Entry Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>New Contra Entry</CardTitle>
                        <CardDescription>
                            Record a cheque deposit or withdrawal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ContraEntryForm stores={stores} />
                    </CardContent>
                </Card>

                {/* Recent Entries */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Entries</CardTitle>
                        <CardDescription>
                            Last 10 contra entries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{entry.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </p>
                                        <div className="flex gap-4 mt-1 text-xs text-gray-600">
                                            <span>From: {entry.creditAccount}</span>
                                            <span>To: {entry.debitAccount}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">
                                            ₹{entry.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentEntries.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">No contra entries yet</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Information Card */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-blue-900">What is a Contra Entry?</CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 text-sm space-y-2">
                    <p>
                        A contra entry is used when money is transferred between two accounts within the same organization,
                        such as:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Depositing cash into a bank account</li>
                        <li>Withdrawing cash from a bank account</li>
                        <li>Transferring money between bank accounts</li>
                        <li>Recording cheque deposits or withdrawals</li>
                    </ul>
                    <p className="mt-3">
                        <strong>Note:</strong> Both debit and credit entries affect cash or bank accounts only.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

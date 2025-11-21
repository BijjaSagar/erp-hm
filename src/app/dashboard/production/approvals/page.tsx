import { getPendingApprovals } from "./actions";
import { ApprovalList } from "./approval-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default async function ApprovalsPage() {
    const { pendingEntries, error } = await getPendingApprovals();

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center">
                    <CheckSquare className="mr-3 h-8 w-8" />
                    Production Approvals
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Quality Checks</CardTitle>
                </CardHeader>
                <CardContent>
                    <ApprovalList entries={pendingEntries || []} />
                </CardContent>
            </Card>
        </div>
    );
}

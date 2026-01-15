export const dynamic = 'force-dynamic';

import { getProductionEntryById } from "@/actions/production-entry";
import { getMaterialConsumptionByEntry } from "@/actions/material-consumption";
import { notFound } from "next/navigation";
import CompleteProductionForm from "./complete-form";

export default async function CompleteProductionPage({
    params
}: {
    params: { orderId: string; entryId: string }
}) {
    const [entry, materialConsumptions] = await Promise.all([
        getProductionEntryById(params.entryId),
        getMaterialConsumptionByEntry(params.entryId),
    ]);

    if (!entry) {
        notFound();
    }

    if (entry.endTime) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                        Production Entry Already Completed
                    </h3>
                    <p className="text-amber-700">
                        This production entry was completed on {new Date(entry.endTime).toLocaleString()}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Complete Production Entry
                </h2>
                <p className="text-muted-foreground">
                    Order {entry.order.orderNumber} - {entry.order.customerName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Stage: <span className="font-semibold">{entry.stage.replace('_', ' ')}</span>
                </p>
            </div>
            <CompleteProductionForm
                entry={entry}
                materialConsumptions={materialConsumptions}
            />
        </div>
    );
}

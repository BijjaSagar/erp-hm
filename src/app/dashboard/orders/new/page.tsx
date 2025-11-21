export const dynamic = 'force-dynamic';

import { getBranches } from "@/actions/branch";
import NewOrderForm from "./form";

export default async function NewOrderPage() {
    const branches = await getBranches();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create New Order</h2>
                <p className="text-muted-foreground">Add a new customer order with items</p>
            </div>
            <NewOrderForm branches={branches} />
        </div>
    );
}

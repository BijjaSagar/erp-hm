export const dynamic = 'force-dynamic';

import { getCompletedOrdersWithoutInvoice } from "@/actions/invoice";
import NewInvoiceForm from "./form";

export default async function NewInvoicePage() {
    const orders = await getCompletedOrdersWithoutInvoice();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Generate Invoice</h2>
                <p className="text-muted-foreground">Create invoice for completed orders</p>
            </div>
            <NewInvoiceForm orders={orders} />
        </div>
    );
}

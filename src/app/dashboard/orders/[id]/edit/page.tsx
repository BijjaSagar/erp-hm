export const dynamic = 'force-dynamic';

import { getOrderById } from "@/actions/order";
import { getBranches } from "@/actions/branch";
import { notFound } from "next/navigation";
import EditOrderForm from "./form";

export default async function EditOrderPage({ params }: { params: { id: string } }) {
    const [order, branches] = await Promise.all([
        getOrderById(params.id),
        getBranches(),
    ]);

    if (!order) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Edit Order {order.orderNumber}
                </h2>
                <p className="text-muted-foreground">Update order information</p>
            </div>
            <EditOrderForm
                order={JSON.parse(JSON.stringify(order))}
                branches={JSON.parse(JSON.stringify(branches))}
            />
        </div>
    );
}

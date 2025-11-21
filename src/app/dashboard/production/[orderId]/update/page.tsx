export const dynamic = 'force-dynamic';

import { getOrderById } from "@/actions/order";
import { getEmployees } from "@/actions/employee";
import { notFound } from "next/navigation";
import UpdateStageForm from "./update-form";

export default async function UpdateStagePage({ params }: { params: { orderId: string } }) {
    const [order, employees] = await Promise.all([
        getOrderById(params.orderId),
        getEmployees(),
    ]);

    if (!order) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Update Production Stage
                </h2>
                <p className="text-muted-foreground">
                    Order {order.orderNumber} - {order.customerName}
                </p>
            </div>
            <UpdateStageForm order={order} employees={employees} />
        </div>
    );
}

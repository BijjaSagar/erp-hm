export const dynamic = 'force-dynamic';

import { getOrderById } from "@/actions/order";
import { getMachinesByStage } from "@/actions/machine";
import { getEmployees } from "@/actions/employee";
import { notFound } from "next/navigation";
import StartProductionForm from "./start-form";

export default async function StartProductionPage({ params }: { params: { orderId: string } }) {
    const [order, employees] = await Promise.all([
        getOrderById(params.orderId),
        getEmployees(),
    ]);

    if (!order) {
        notFound();
    }

    // Get machines for the current stage
    const machines = await getMachinesByStage(order.currentStage);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Start Production Entry
                </h2>
                <p className="text-muted-foreground">
                    Order {order.orderNumber} - {order.customerName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Current Stage: <span className="font-semibold">{order.currentStage.replace('_', ' ')}</span>
                </p>
            </div>
            <StartProductionForm
                order={order}
                machines={machines}
                employees={employees}
            />
        </div>
    );
}

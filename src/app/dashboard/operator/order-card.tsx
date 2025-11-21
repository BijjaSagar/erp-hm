'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductionStage } from "@prisma/client";
import { updateOrderStage } from "./actions";
import { useRouter } from "next/navigation";

interface OrderCardProps {
    order: {
        id: string;
        orderNumber: string;
        customerName: string;
        status: string;
        currentStage: ProductionStage;
        items: {
            id: string;
            productName: string;
            quantity: number;
        }[];
    };
    stages: ProductionStage[];
}

export function OrderCard({ order, stages }: OrderCardProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticStage, setOptimisticStage] = useState(order.currentStage);
    const router = useRouter();

    async function handleUpdate(formData: FormData) {
        const stage = formData.get('stage') as ProductionStage;
        if (!stage) return;

        // Optimistic update
        setOptimisticStage(stage);

        const result = await updateOrderStage(order.id, stage);

        if (result.success) {
            startTransition(() => {
                router.refresh();
            });
        } else {
            // Revert on failure
            setOptimisticStage(order.currentStage);
            alert(result.error || "Failed to update stage");
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {order.status}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-2">
                    <div className="text-sm font-medium">Items:</div>
                    <ul className="text-sm list-disc list-inside text-muted-foreground">
                        {order.items.map((item) => (
                            <li key={item.id}>
                                {item.productName} (x{item.quantity})
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Current Stage: {optimisticStage.replace(/_/g, ' ')}</p>
                    <form action={handleUpdate} className="flex gap-2">
                        <Select name="stage" value={optimisticStage} onValueChange={(val) => setOptimisticStage(val as ProductionStage)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Update Stage" />
                            </SelectTrigger>
                            <SelectContent>
                                {stages.map((stage) => (
                                    <SelectItem key={stage} value={stage}>
                                        {stage.replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit" size="sm" disabled={isPending}>
                            {isPending ? "Updating..." : "Update"}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

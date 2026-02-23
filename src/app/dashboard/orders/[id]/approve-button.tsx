'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { approveOrder } from "@/actions/manager";
import { useRouter } from 'next/navigation';

interface ApproveOrderButtonProps {
    orderId: string;
}

export function ApproveOrderButton({ orderId }: ApproveOrderButtonProps) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        if (!confirm("Are you sure you want to approve this order?")) return;

        setIsPending(true);
        try {
            const result = await approveOrder(orderId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to approve order");
            }
        } catch (error) {
            console.error("Failed to approve order", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
        >
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Approve Order
        </Button>
    );
}

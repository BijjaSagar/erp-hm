"use client";

import { approveOrder, rejectOrder } from "@/actions/marketing-orders";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface OrderApprovalButtonsProps {
    orderId: string;
}

export default function OrderApprovalButtons({ orderId }: OrderApprovalButtonsProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = async () => {
        if (!confirm("Approve this order?")) return;
        setIsApproving(true);
        const result = await approveOrder(orderId);
        if (result.message.includes("success")) {
            window.location.reload();
        } else {
            alert(result.message);
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Reject this order?")) return;
        setIsRejecting(true);
        const result = await rejectOrder(orderId);
        if (result.message.includes("success")) {
            window.location.reload();
        } else {
            alert(result.message);
            setIsRejecting(false);
        }
    };

    return (
        <div className="flex gap-2 mt-2">
            <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
            >
                <CheckCircle className="mr-1 h-3 w-3" />
                {isApproving ? "Approving..." : "Approve"}
            </Button>
            <Button
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                size="sm"
                variant="destructive"
            >
                <XCircle className="mr-1 h-3 w-3" />
                {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
        </div>
    );
}

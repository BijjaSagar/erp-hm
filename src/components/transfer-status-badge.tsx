import { Badge } from "@/components/ui/badge";
import { TransferStatus } from "@prisma/client";
import {
    Clock,
    Truck,
    CheckCircle2,
    XCircle
} from "lucide-react";

interface TransferStatusBadgeProps {
    status: TransferStatus;
}

export function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
    const getStatusConfig = () => {
        switch (status) {
            case "PENDING":
                return {
                    label: "Pending",
                    className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0",
                    icon: <Clock className="h-3 w-3" />
                };
            case "IN_TRANSIT":
                return {
                    label: "In Transit",
                    className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0",
                    icon: <Truck className="h-3 w-3" />
                };
            case "RECEIVED":
                return {
                    label: "Received",
                    className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
                    icon: <CheckCircle2 className="h-3 w-3" />
                };
            case "CANCELLED":
                return {
                    label: "Cancelled",
                    className: "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0",
                    icon: <XCircle className="h-3 w-3" />
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Badge className={config.className}>
            <span className="flex items-center gap-1">
                {config.icon}
                {config.label}
            </span>
        </Badge>
    );
}

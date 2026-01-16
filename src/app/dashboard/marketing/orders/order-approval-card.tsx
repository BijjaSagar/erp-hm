"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveOrder, rejectOrder } from "@/actions/marketing-orders";
import { CheckCircle, XCircle, Package, MapPin, Calendar, User, Phone } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface OrderApprovalCardProps {
    order: any;
    showActions?: boolean;
}

export default function OrderApprovalCard({ order, showActions = true }: OrderApprovalCardProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = async () => {
        if (!confirm("Are you sure you want to approve this order?")) return;
        setIsApproving(true);
        const result = await approveOrder(order.id);
        if (result.message.includes("success")) {
            window.location.reload();
        } else {
            alert(result.message);
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this order?")) return;
        setIsRejecting(true);
        const result = await rejectOrder(order.id);
        if (result.message.includes("success")) {
            window.location.reload();
        } else {
            alert(result.message);
            setIsRejecting(false);
        }
    };

    const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
        APPROVED: "bg-green-100 text-green-800 border-green-300",
        CANCELLED: "bg-red-100 text-red-800 border-red-300",
        IN_PRODUCTION: "bg-blue-100 text-blue-800 border-blue-300",
        COMPLETED: "bg-purple-100 text-purple-800 border-purple-300",
        DELIVERED: "bg-gray-100 text-gray-800 border-gray-300",
    };

    const statusClass = statusColors[order.status as keyof typeof statusColors] || "";

    return (
        <Card className={order.status === "PENDING" ? "border-yellow-300 shadow-lg" : ""}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                        </div>
                    </div>
                    <Badge className={statusClass}>
                        {order.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Customer:</span>
                            <span>{order.customerName}</span>
                        </div>
                        {order.customerPhone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Phone:</span>
                                <span>{order.customerPhone}</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        {order.branch && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Branch:</span>
                                <span>{order.branch.name}</span>
                            </div>
                        )}
                        {order.customerAddress && (
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <span className="font-medium">Address:</span>
                                    <p className="text-muted-foreground">{order.customerAddress}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Order Items ({order.items.length})
                    </h4>
                    <div className="space-y-2">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium">{item.productName}</p>
                                    {item.dimensions && (
                                        <p className="text-sm text-muted-foreground">Dimensions: {item.dimensions}</p>
                                    )}
                                    {item.material && (
                                        <p className="text-sm text-muted-foreground">Material: {item.material}</p>
                                    )}
                                </div>
                                <Badge variant="outline">
                                    Qty: {item.quantity}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                {showActions && order.status === "PENDING" && (
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {isApproving ? "Approving..." : "Approve Order"}
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isApproving || isRejecting}
                            variant="destructive"
                            className="flex-1"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            {isRejecting ? "Rejecting..." : "Reject Order"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

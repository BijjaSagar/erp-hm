"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Truck, Loader2 } from "lucide-react";
import { transferFromProduction } from "@/actions/stock-transfer";
import { useRouter } from "next/navigation";

interface QuickTransferButtonProps {
    order: {
        id: string;
        orderNumber: string;
        customerName: string;
        items: Array<{
            id: string;
            productName: string;
            quantity: number;
        }>;
    };
    stores: Array<{
        id: string;
        name: string;
        address: string | null;
    }>;
}

export function QuickTransferButton({ order, stores }: QuickTransferButtonProps) {
    const [open, setOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleTransfer = async () => {
        if (!selectedStore) return;

        setLoading(true);
        try {
            // Create items array with SKU
            const items = order.items.map(item => ({
                productName: item.productName,
                sku: `SKU-${item.id}`,
                quantity: item.quantity,
                unit: "pcs"
            }));

            const result = await transferFromProduction(order.id, selectedStore, items);

            if (result.message.includes("successfully")) {
                setOpen(false);
                router.push("/dashboard/stock-transfers");
                router.refresh();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Transfer error:", error);
            alert("Failed to create transfer");
        } finally {
            setLoading(false);
        }
    };

    if (stores.length === 0) {
        return null; // Don't show button if no stores available
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <Truck className="h-3 w-3 mr-1" />
                    Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Transfer to Store</DialogTitle>
                    <DialogDescription>
                        Create a stock transfer for order {order.orderNumber}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Order Details</Label>
                        <div className="p-3 bg-muted rounded-lg text-sm">
                            <div className="font-medium">{order.orderNumber}</div>
                            <div className="text-muted-foreground">{order.customerName}</div>
                            <div className="text-muted-foreground">{order.items.length} item(s)</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="store">Select Destination Store</Label>
                        <select
                            id="store"
                            className="w-full p-2 border rounded-md"
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                        >
                            <option value="">Choose a store...</option>
                            {stores.map((store) => (
                                <option key={store.id} value={store.id}>
                                    {store.name} {store.address && `- ${store.address}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={!selectedStore || loading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Truck className="h-4 w-4 mr-2" />
                                Create Transfer
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

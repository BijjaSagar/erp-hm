"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Edit2 } from "lucide-react";
import { updateStoreInventoryPrice } from "@/actions/store";
import { useRouter } from "next/navigation";

export function UpdatePriceForm({
    storeId, sku, currentCostPrice, currentSellingPrice
}: {
    storeId: string; sku: string; currentCostPrice: number; currentSellingPrice: number;
}) {
    const [open, setOpen] = useState(false);
    const [cost, setCost] = useState(currentCostPrice.toString());
    const [selling, setSelling] = useState(currentSellingPrice.toString());
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handle = () => {
        startTransition(async () => {
            await updateStoreInventoryPrice(storeId, sku, parseFloat(cost), parseFloat(selling));
            setOpen(false);
            router.refresh();
        });
    };

    if (!open) {
        return (
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}
                className="text-blue-600 hover:text-blue-800 text-xs">
                <Edit2 className="h-3 w-3 mr-1" /> Set Price
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <Input
                type="number" value={cost} onChange={e => setCost(e.target.value)}
                className="w-20 text-xs h-7" placeholder="Cost"
            />
            <Input
                type="number" value={selling} onChange={e => setSelling(e.target.value)}
                className="w-20 text-xs h-7" placeholder="Sell"
            />
            <Button size="sm" onClick={handle} disabled={isPending}
                className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2">
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 text-xs px-2">✕</Button>
        </div>
    );
}

'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateStock } from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { StockTxType } from "@prisma/client";

interface StockUpdateFormProps {
    itemId: string;
    itemName: string;
}

export function StockUpdateForm({ itemId, itemName }: StockUpdateFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const quantity = parseFloat(formData.get('quantity') as string);
        const type = formData.get('type') as StockTxType;

        if (!quantity || !type) {
            setLoading(false);
            return;
        }

        const result = await updateStock(itemId, quantity, type);

        if (result.success) {
            startTransition(() => {
                router.refresh();
                setOpen(false);
                setLoading(false);
            });
        } else {
            setLoading(false);
            alert(result.error || "Failed to update stock");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Update Stock</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Stock: {itemName}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IN">Add Stock (IN)</SelectItem>
                                <SelectItem value="OUT">Consume Stock (OUT)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" name="quantity" step="0.01" required min="0" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || isPending}>
                        {loading || isPending ? "Updating..." : "Confirm Update"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

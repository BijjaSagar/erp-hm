'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allocateMaterial } from "@/actions/manager";
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Box } from "lucide-react";

interface MaterialAllocationFormProps {
    orderId: string;
    inventoryItems: any[];
}

export function MaterialAllocationForm({ orderId, inventoryItems }: MaterialAllocationFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [notes, setNotes] = useState<string>('');
    const router = useRouter();

    const selectedMaterial = inventoryItems.find(i => i.id === selectedMaterialId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterialId || quantity <= 0) return;

        setIsPending(true);
        try {
            const result = await allocateMaterial({
                orderId,
                materialId: selectedMaterialId,
                quantity,
                unit: selectedMaterial?.unit || 'kg',
                notes
            });

            if (result.success) {
                setSelectedMaterialId('');
                setQuantity(0);
                setNotes('');
                router.refresh();
            } else {
                alert(result.error || "Failed to allocate material");
            }
        } catch (error) {
            console.error("Failed to allocate material", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                    <Box className="mr-2 h-4 w-4 text-blue-600" />
                    Allocate Materials
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="material">Material</Label>
                            <Select
                                value={selectedMaterialId}
                                onValueChange={setSelectedMaterialId}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inventoryItems.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name} ({item.quantity} {item.unit} available)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity ({selectedMaterial?.unit || 'units'})</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="bg-white"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-white"
                            placeholder="e.g. For cutting phase"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isPending || !selectedMaterialId || quantity <= 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Allocate Material
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

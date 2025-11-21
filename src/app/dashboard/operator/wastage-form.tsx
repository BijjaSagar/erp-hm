'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { logWastage } from './wastage-actions';
import { useRouter } from 'next/navigation';
import { ProductionStage } from '@prisma/client';

export function WastageForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [materialName, setMaterialName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [reason, setReason] = useState('');
    const [stage, setStage] = useState<ProductionStage | ''>('');
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!materialName || !quantity || !unit || !reason || !stage) {
            setError("Please fill in all required fields");
            return;
        }

        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) {
            setError("Please enter a valid quantity");
            return;
        }

        setError(null);
        startTransition(async () => {
            try {
                const result = await logWastage({
                    materialName,
                    quantity: qty,
                    unit,
                    reason,
                    stage: stage as ProductionStage,
                    orderId: orderId || undefined
                });

                if (result.error) {
                    setError(result.error);
                } else {
                    setSuccess(true);
                    // Reset form
                    setMaterialName('');
                    setQuantity('');
                    setUnit('');
                    setReason('');
                    setStage('');
                    setOrderId('');
                    setTimeout(() => {
                        setSuccess(false);
                        router.refresh();
                    }, 2000);
                }
            } catch (e) {
                setError("Failed to log wastage");
            }
        });
    };

    const stages = [
        { value: 'CUTTING', label: 'Cutting' },
        { value: 'SHAPING', label: 'Shaping' },
        { value: 'BENDING', label: 'Bending' },
        { value: 'WELDING_INNER', label: 'Welding Inner' },
        { value: 'WELDING_OUTER', label: 'Welding Outer' },
        { value: 'GRINDING', label: 'Grinding' },
        { value: 'FINISHING', label: 'Finishing' },
        { value: 'PAINTING', label: 'Painting' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Log Wastage
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
                            Wastage logged successfully!
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="materialName">Material Name *</Label>
                            <Input
                                id="materialName"
                                value={materialName}
                                onChange={(e) => setMaterialName(e.target.value)}
                                placeholder="e.g., MS Sheet, Welding Wire"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stage">Production Stage *</Label>
                            <Select onValueChange={(value) => setStage(value as ProductionStage)} value={stage}>
                                <SelectTrigger id="stage">
                                    <SelectValue placeholder="Select stage..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit *</Label>
                            <Select onValueChange={setUnit} value={unit}>
                                <SelectTrigger id="unit">
                                    <SelectValue placeholder="Select unit..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                    <SelectItem value="m">Meters (m)</SelectItem>
                                    <SelectItem value="sqft">Square Feet (sqft)</SelectItem>
                                    <SelectItem value="ltr">Liters (ltr)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orderId">Order Number (Optional)</Label>
                        <Input
                            id="orderId"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="e.g., ORD-001"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason *</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe the reason for wastage..."
                            rows={4}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging Wastage...
                            </>
                        ) : (
                            "Log Wastage"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

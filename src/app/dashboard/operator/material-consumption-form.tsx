'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
import { getAvailableMaterials } from './production-actions';
import { ProductionStage } from '@prisma/client';

interface MaterialConsumptionFormProps {
    stage: ProductionStage;
    onChange: (materials: any[]) => void;
}

export function MaterialConsumptionForm({ stage, onChange }: MaterialConsumptionFormProps) {
    const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
    const [consumedMaterials, setConsumedMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMaterials() {
            const result = await getAvailableMaterials(stage);
            if (result.materials) {
                setAvailableMaterials(result.materials);
            }
            setLoading(false);
        }
        fetchMaterials();
    }, [stage]);

    const handleAddMaterial = () => {
        setConsumedMaterials([...consumedMaterials, { materialId: '', quantity: 0, unit: '' }]);
    };

    const handleRemoveMaterial = (index: number) => {
        const newMaterials = [...consumedMaterials];
        newMaterials.splice(index, 1);
        setConsumedMaterials(newMaterials);
        onChange(newMaterials);
    };

    const handleMaterialChange = (index: number, field: string, value: any) => {
        const newMaterials = [...consumedMaterials];
        if (field === 'materialId') {
            const material = availableMaterials.find(m => m.id === value);
            newMaterials[index] = {
                ...newMaterials[index],
                materialId: value,
                unit: material?.unit || '',
                materialType: 'OTHER' // Default, should be mapped from category or selected
            };
        } else {
            newMaterials[index] = { ...newMaterials[index], [field]: value };
        }
        setConsumedMaterials(newMaterials);
        onChange(newMaterials);
    };

    if (loading) return <div>Loading materials...</div>;

    return (
        <div className="space-y-4 border p-4 rounded-md bg-slate-50">
            <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Material Consumption</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMaterial}>
                    <Plus className="h-4 w-4 mr-2" /> Add Material
                </Button>
            </div>

            {consumedMaterials.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                    No materials added. Click "Add Material" if you used any consumables.
                </p>
            )}

            {consumedMaterials.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs">Material</Label>
                        <Select
                            value={item.materialId}
                            onValueChange={(val) => handleMaterialChange(index, 'materialId', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMaterials.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.name} ({m.quantity} {m.unit} avail)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-24 space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleMaterialChange(index, 'quantity', Number(e.target.value))}
                            placeholder="0.0"
                        />
                    </div>
                    <div className="w-16 space-y-1">
                        <Label className="text-xs">Unit</Label>
                        <Input
                            value={item.unit}
                            readOnly
                            className="bg-slate-100"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleRemoveMaterial(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}

"use client";

import { useFormState } from "react-dom";
import { recordMaterialUsage } from "@/actions/material-usage";
import { getRawMaterials } from "@/actions/raw-material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const initialState = { message: "" };

export default function RecordUsagePage() {
    const [state, formAction] = useFormState(recordMaterialUsage, initialState);
    const router = useRouter();
    const [materials, setMaterials] = useState<any[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [quantity, setQuantity] = useState("");

    useEffect(() => {
        getRawMaterials().then(setMaterials);
    }, []);

    useEffect(() => {
        if (state.message && !state.message.includes("Failed") && !state.message.includes("Insufficient")) {
            router.push("/dashboard/marketing/usage");
        }
    }, [state.message, router]);

    const material = materials.find(m => m.id === selectedMaterial);
    const isInsufficient = material && parseFloat(quantity) > material.quantity;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/marketing/usage">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Record Material Usage</h2>
                    <p className="text-muted-foreground">Track material consumption</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usage Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="materialId">Material *</Label>
                                <Select
                                    name="materialId"
                                    value={selectedMaterial}
                                    onValueChange={setSelectedMaterial}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materials.map((mat) => (
                                            <SelectItem key={mat.id} value={mat.id}>
                                                {mat.name} (Available: {mat.quantity} {mat.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {material && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Available: {material.quantity} {material.unit}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="quantity">Quantity *</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    step="0.01"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                />
                                {isInsufficient && (
                                    <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Insufficient stock
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="unit">Unit *</Label>
                                <Input
                                    id="unit"
                                    name="unit"
                                    value={material?.unit || ""}
                                    readOnly
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="usedFor">Used For</Label>
                                <Input
                                    id="usedFor"
                                    name="usedFor"
                                    placeholder="e.g., Production Order #123"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="usedBy">Used By</Label>
                                <Input
                                    id="usedBy"
                                    name="usedBy"
                                    placeholder="Person or department"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="usedAt">Usage Date *</Label>
                                <Input
                                    id="usedAt"
                                    name="usedAt"
                                    type="date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Additional notes"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {state.message && (
                            <div className={`p-3 rounded-lg text-sm ${state.message.includes("Failed") || state.message.includes("Insufficient")
                                    ? "bg-red-50 text-red-600"
                                    : "bg-green-50 text-green-600"
                                }`}>
                                {state.message}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={isInsufficient}>
                                Record Usage
                            </Button>
                            <Link href="/dashboard/marketing/usage">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

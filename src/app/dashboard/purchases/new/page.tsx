"use client";

import { useFormState } from "react-dom";
import { createPurchase } from "@/actions/purchase";
import { getRawMaterials } from "@/actions/raw-material";
import { getSellers } from "@/actions/seller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const initialState = { message: "" };

export default function NewPurchasePage() {
    const [state, formAction] = useFormState(createPurchase, initialState);
    const router = useRouter();
    const [materials, setMaterials] = useState<any[]>([]);
    const [sellers, setSellers] = useState<any[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [quantity, setQuantity] = useState("");
    const [pricePerUnit, setPricePerUnit] = useState("");
    const [transportCost, setTransportCost] = useState("");

    useEffect(() => {
        getRawMaterials().then(setMaterials);
        getSellers().then(setSellers);
    }, []);

    useEffect(() => {
        if (state.message && !state.message.includes("Failed")) {
            router.push("/dashboard/purchases");
        }
    }, [state.message, router]);

    const material = materials.find(m => m.id === selectedMaterial);
    const totalPrice = (parseFloat(quantity) || 0) * (parseFloat(pricePerUnit) || 0);
    const grandTotal = totalPrice + (parseFloat(transportCost) || 0);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/purchases">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Record Purchase</h2>
                    <p className="text-muted-foreground">Add a new raw material purchase</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="sellerId">Seller *</Label>
                                <Select name="sellerId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select seller" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sellers.map((seller) => (
                                            <SelectItem key={seller.id} value={seller.id}>
                                                {seller.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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
                                                {mat.name} ({mat.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                            <div>
                                <Label htmlFor="pricePerUnit">Price per Unit *</Label>
                                <Input
                                    id="pricePerUnit"
                                    name="pricePerUnit"
                                    type="number"
                                    step="0.01"
                                    value={pricePerUnit}
                                    onChange={(e) => setPricePerUnit(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="transportationCost">Transportation Cost</Label>
                                <Input
                                    id="transportationCost"
                                    name="transportationCost"
                                    type="number"
                                    step="0.01"
                                    value={transportCost}
                                    onChange={(e) => setTransportCost(e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="billNumber">Bill Number</Label>
                                <Input
                                    id="billNumber"
                                    name="billNumber"
                                    placeholder="Invoice/Bill number"
                                />
                            </div>

                            <div>
                                <Label htmlFor="billDate">Bill Date</Label>
                                <Input
                                    id="billDate"
                                    name="billDate"
                                    type="date"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                                <Input
                                    id="purchaseDate"
                                    name="purchaseDate"
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

                            {(quantity && pricePerUnit) && (
                                <div className="col-span-2 p-4 bg-muted rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Total Price:</span>
                                        <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    {transportCost && (
                                        <div className="flex justify-between text-sm">
                                            <span>Transportation:</span>
                                            <span className="font-medium">₹{parseFloat(transportCost).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Grand Total:</span>
                                        <span>₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {state.message && (
                            <div className={`p-3 rounded-lg text-sm ${state.message.includes("Failed")
                                    ? "bg-red-50 text-red-600"
                                    : "bg-green-50 text-green-600"
                                }`}>
                                {state.message}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button type="submit">Record Purchase</Button>
                            <Link href="/dashboard/purchases">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

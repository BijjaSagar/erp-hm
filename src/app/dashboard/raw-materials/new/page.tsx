"use client";

import { useFormState } from "react-dom";
import { createRawMaterial } from "@/actions/raw-material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const initialState = { message: "" };

export default function NewRawMaterialPage() {
    const [state, formAction] = useFormState(createRawMaterial, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.message && !state.message.includes("Failed")) {
            router.push("/dashboard/raw-materials");
        }
    }, [state.message, router]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/raw-materials">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add Raw Material</h2>
                    <p className="text-muted-foreground">Create a new raw material entry</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Material Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="name">Material Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., M.S Sheet"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    placeholder="e.g., Metal Sheets"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="unit">Unit *</Label>
                                <Input
                                    id="unit"
                                    name="unit"
                                    placeholder="e.g., kg, pieces, liters"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="quantity">Initial Quantity</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    defaultValue="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="reorderLevel">Reorder Level</Label>
                                <Input
                                    id="reorderLevel"
                                    name="reorderLevel"
                                    type="number"
                                    step="0.01"
                                    placeholder="Minimum stock level"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="currentPrice">Current Price (per unit)</Label>
                                <Input
                                    id="currentPrice"
                                    name="currentPrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="Price per unit"
                                />
                            </div>
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
                            <Button type="submit">Create Material</Button>
                            <Link href="/dashboard/raw-materials">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

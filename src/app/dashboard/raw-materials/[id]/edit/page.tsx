"use client";

import { useFormState } from "react-dom";
import { updateRawMaterial, deleteRawMaterial, getRawMaterialById } from "@/actions/raw-material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditRawMaterialPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [material, setMaterial] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const updateWithId = updateRawMaterial.bind(null, params.id);
    const [state, formAction] = useFormState(updateWithId, { message: "" });

    useEffect(() => {
        getRawMaterialById(params.id).then(setMaterial);
    }, [params.id]);

    useEffect(() => {
        if (state.message && !state.message.includes("Failed")) {
            router.push("/dashboard/raw-materials");
        }
    }, [state.message, router]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        setIsDeleting(true);
        const result = await deleteRawMaterial(params.id);
        if (!result.message.includes("Failed")) {
            router.push("/dashboard/raw-materials");
        } else {
            alert(result.message);
            setIsDeleting(false);
        }
    };

    if (!material) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/raw-materials">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Raw Material</h2>
                    <p className="text-muted-foreground">Update material information</p>
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
                                    defaultValue={material.name}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    defaultValue={material.category}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="unit">Unit *</Label>
                                <Input
                                    id="unit"
                                    name="unit"
                                    defaultValue={material.unit}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="quantity">Current Quantity</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    step="0.01"
                                    defaultValue={material.quantity}
                                />
                            </div>

                            <div>
                                <Label htmlFor="reorderLevel">Reorder Level</Label>
                                <Input
                                    id="reorderLevel"
                                    name="reorderLevel"
                                    type="number"
                                    step="0.01"
                                    defaultValue={material.reorderLevel || ""}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="currentPrice">Current Price (per unit)</Label>
                                <Input
                                    id="currentPrice"
                                    name="currentPrice"
                                    type="number"
                                    step="0.01"
                                    defaultValue={material.currentPrice || ""}
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

                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                            <div className="flex gap-2">
                                <Link href="/dashboard/raw-materials">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit">Update Material</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

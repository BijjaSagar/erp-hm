"use client";

import { useFormState } from "react-dom";
import { updateSeller, deleteSeller, getSellerById } from "@/actions/seller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditSellerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [seller, setSeller] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const updateWithId = updateSeller.bind(null, params.id);
    const [state, formAction] = useFormState(updateWithId, { message: "" });

    useEffect(() => {
        getSellerById(params.id).then((data) => {
            setSeller(data);
            setIsActive(data?.isActive || false);
        });
    }, [params.id]);

    useEffect(() => {
        if (state.message && !state.message.includes("Failed")) {
            router.push("/dashboard/marketing/sellers");
        }
    }, [state.message, router]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this seller?")) return;
        setIsDeleting(true);
        const result = await deleteSeller(params.id);
        if (!result.message.includes("Failed")) {
            router.push("/dashboard/marketing/sellers");
        } else {
            alert(result.message);
            setIsDeleting(false);
        }
    };

    if (!seller) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/marketing/sellers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Seller</h2>
                    <p className="text-muted-foreground">Update seller information</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seller Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="name">Seller Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={seller.name}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact">Contact Person</Label>
                                <Input
                                    id="contact"
                                    name="contact"
                                    defaultValue={seller.contact || ""}
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={seller.phone || ""}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={seller.email || ""}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    defaultValue={seller.address || ""}
                                    rows={3}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="gstNumber">GST Number</Label>
                                <Input
                                    id="gstNumber"
                                    name="gstNumber"
                                    defaultValue={seller.gstNumber || ""}
                                />
                            </div>

                            <div className="col-span-2 flex items-center justify-between">
                                <Label htmlFor="isActive">Active Status</Label>
                                <Switch
                                    id="isActive"
                                    name="isActive"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                                <input type="hidden" name="isActive" value={isActive.toString()} />
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
                                <Link href="/dashboard/marketing/sellers">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit">Update Seller</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

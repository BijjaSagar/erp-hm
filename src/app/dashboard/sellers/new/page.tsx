"use client";

import { useFormState } from "react-dom";
import { createSeller } from "@/actions/seller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const initialState = { message: "" };

export default function NewSellerPage() {
    const [state, formAction] = useFormState(createSeller, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.message && !state.message.includes("Failed")) {
            router.push("/dashboard/sellers");
        }
    }, [state.message, router]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/sellers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add Seller</h2>
                    <p className="text-muted-foreground">Create a new supplier/vendor</p>
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
                                    placeholder="Company or person name"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact">Contact Person</Label>
                                <Input
                                    id="contact"
                                    name="contact"
                                    placeholder="Contact person name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+91 1234567890"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seller@example.com"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    placeholder="Full address"
                                    rows={3}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="gstNumber">GST Number</Label>
                                <Input
                                    id="gstNumber"
                                    name="gstNumber"
                                    placeholder="GST registration number"
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
                            <Button type="submit">Create Seller</Button>
                            <Link href="/dashboard/sellers">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

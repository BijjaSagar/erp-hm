"use client";

import { useState, useTransition } from "react";
import { createStore } from "@/actions/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormState {
    message: string;
    errors?: {
        name?: string[];
        code?: string[];
        address?: string[];
        phone?: string[];
        email?: string[];
    };
}

const initialState: FormState = {
    message: "",
};

export default function StoreForm() {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await createStore(state, formData);
            setState(result as FormState);

            if (result.message === "Success") {
                router.push("/dashboard/stores");
            }
        });
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Store Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Downtown Showroom"
                                required
                            />
                            {state.errors?.name && (
                                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Store Code *</Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="e.g. DS01"
                                required
                            />
                            {state.errors?.code && (
                                <p className="text-sm text-red-500">{state.errors.code[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Full address"
                            required
                        />
                        {state.errors?.address && (
                            <p className="text-sm text-red-500">{state.errors.address[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+91..."
                            />
                            {state.errors?.phone && (
                                <p className="text-sm text-red-500">{state.errors.phone[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="store@example.com"
                            />
                            {state.errors?.email && (
                                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                            id="gstNumber"
                            name="gstNumber"
                            placeholder="GST Number"
                        />
                    </div>

                    {state.message && state.message !== "Success" && (
                        <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm text-center">
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Store"
                            )}
                        </Button>
                        <Link href="/dashboard/stores">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

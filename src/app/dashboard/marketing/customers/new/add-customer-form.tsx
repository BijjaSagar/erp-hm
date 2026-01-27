"use client";

import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createCustomer } from "@/actions/customer";
import { useEffect } from "react";

const initialState = {
    message: "",
    errors: {},
};

export function AddCustomerForm() {
    const router = useRouter();
    const [state, formAction] = useFormState(createCustomer, initialState);

    useEffect(() => {
        if (state?.message === "Success" && state?.customerId) {
            alert("Customer created successfully!");
            router.push("/dashboard/marketing/customers");
            router.refresh();
        } else if (state?.message && state.message !== "Success") {
            alert(state.message);
        }
    }, [state, router]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Customer Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter customer name"
                                required
                            />
                            {state?.errors?.name && (
                                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerType">Customer Type *</Label>
                            <select
                                id="customerType"
                                name="customerType"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue="RETAIL"
                            >
                                <option value="RETAIL">Retail</option>
                                <option value="REGULAR">Regular</option>
                                <option value="WHOLESALE">Wholesale</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+91 1234567890"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="customer@example.com"
                            />
                            {state?.errors?.email && (
                                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input
                                id="gstNumber"
                                name="gstNumber"
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Enter full address"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                            Create Customer
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

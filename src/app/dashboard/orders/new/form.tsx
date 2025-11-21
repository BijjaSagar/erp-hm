"use client";

import { useState, useTransition } from "react";
import { createOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormState {
    message: string;
    orderId?: string;
    orderNumber?: string;
}

const initialState: FormState = {
    message: "",
};

interface OrderItem {
    productName: string;
    quantity: number;
    dimensions: string;
    material: string;
}

export default function NewOrderForm({ branches }: { branches: any[] }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();
    const [items, setItems] = useState<OrderItem[]>([
        { productName: "", quantity: 1, dimensions: "", material: "" }
    ]);

    const addItem = () => {
        setItems([...items, { productName: "", quantity: 1, dimensions: "", material: "" }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = (formData: FormData) => {
        // Validate items
        const hasEmptyProduct = items.some(item => !item.productName.trim());
        if (hasEmptyProduct) {
            setState({ message: "All items must have a product name" });
            return;
        }

        // Add items as JSON
        formData.append("items", JSON.stringify(items));

        startTransition(async () => {
            const result = await createOrder(state, formData);
            setState(result as FormState);

            if (result.orderId) {
                // Redirect to order detail page after 1 second
                setTimeout(() => {
                    router.push(`/dashboard/orders/${result.orderId}`);
                }, 1000);
            }
        });
    };

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        {/* Customer Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Customer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name *</Label>
                                    <Input
                                        id="customerName"
                                        name="customerName"
                                        placeholder="Enter customer name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Phone Number</Label>
                                    <Input
                                        id="customerPhone"
                                        name="customerPhone"
                                        type="tel"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerAddress">Address</Label>
                                <Textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    placeholder="Enter customer address"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branchId">Branch (Optional)</Label>
                                <Select name="branchId">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name} ({branch.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Order Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>

                            {items.map((item, index) => (
                                <Card key={index} className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Item {index + 1}</h4>
                                                {items.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Product Name *</Label>
                                                    <Input
                                                        placeholder="e.g., Steel Cabinet"
                                                        value={item.productName}
                                                        onChange={(e) => updateItem(index, 'productName', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Quantity *</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Dimensions</Label>
                                                    <Input
                                                        placeholder="e.g., 100x50x30 cm"
                                                        value={item.dimensions}
                                                        onChange={(e) => updateItem(index, 'dimensions', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Material</Label>
                                                    <Input
                                                        placeholder="e.g., Stainless Steel"
                                                        value={item.material}
                                                        onChange={(e) => updateItem(index, 'material', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {state?.message && (
                            <div className={`p-3 rounded-md text-sm text-center ${state.message.includes("successfully")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                {state.message}
                                {state.orderNumber && (
                                    <div className="mt-1 font-semibold">
                                        Order Number: {state.orderNumber}
                                    </div>
                                )}
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
                                        Creating Order...
                                    </>
                                ) : (
                                    "Create Order"
                                )}
                            </Button>
                            <Link href="/dashboard/orders">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

"use client";

import { useFormState } from "react-dom";
import { createOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const initialState = { message: "" };

export default function NewOrderPage() {
    const [state, formAction] = useFormState(createOrder, initialState);
    const router = useRouter();
    const [items, setItems] = useState([
        { productName: "", quantity: 1, dimensions: "", material: "" }
    ]);

    useEffect(() => {
        if (state.message && !state.message.includes("Failed")) {
            router.push("/dashboard/marketing/orders");
        }
    }, [state.message, router]);

    const addItem = () => {
        setItems([...items, { productName: "", quantity: 1, dimensions: "", material: "" }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/marketing/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create New Order</h2>
                    <p className="text-muted-foreground">Add a new customer order</p>
                </div>
            </div>

            <form action={formAction} className="space-y-6">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="customerName">Customer Name *</Label>
                                <Input
                                    id="customerName"
                                    name="customerName"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="customerPhone">Phone Number</Label>
                                <Input
                                    id="customerPhone"
                                    name="customerPhone"
                                    type="tel"
                                    placeholder="+91 1234567890"
                                />
                            </div>

                            <div>
                                <Label htmlFor="orderNumber">Order Number</Label>
                                <Input
                                    id="orderNumber"
                                    name="orderNumber"
                                    placeholder="Auto-generated if empty"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="customerAddress">Delivery Address</Label>
                                <Textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    placeholder="Full delivery address"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Order Items</CardTitle>
                        <Button type="button" onClick={addItem} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">Item {index + 1}</h4>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor={`productName-${index}`}>Product Name *</Label>
                                        <Input
                                            id={`productName-${index}`}
                                            name={`items[${index}].productName`}
                                            value={item.productName}
                                            onChange={(e) => updateItem(index, "productName", e.target.value)}
                                            placeholder="e.g., Steel Cabinet"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                                        <Input
                                            id={`quantity-${index}`}
                                            name={`items[${index}].quantity`}
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor={`dimensions-${index}`}>Dimensions</Label>
                                        <Input
                                            id={`dimensions-${index}`}
                                            name={`items[${index}].dimensions`}
                                            value={item.dimensions}
                                            onChange={(e) => updateItem(index, "dimensions", e.target.value)}
                                            placeholder="e.g., 6x3x2 feet"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor={`material-${index}`}>Material/Specifications</Label>
                                        <Input
                                            id={`material-${index}`}
                                            name={`items[${index}].material`}
                                            value={item.material}
                                            onChange={(e) => updateItem(index, "material", e.target.value)}
                                            placeholder="e.g., M.S Sheet 18 gauge"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Hidden field for items count */}
                <input type="hidden" name="itemsCount" value={items.length} />

                {state.message && (
                    <div className={`p-3 rounded-lg text-sm ${state.message.includes("Failed")
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}>
                        {state.message}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button type="submit" size="lg">Create Order</Button>
                    <Link href="/dashboard/marketing/orders">
                        <Button type="button" variant="outline" size="lg">Cancel</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}

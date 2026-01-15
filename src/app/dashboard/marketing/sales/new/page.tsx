"use client";

import { useFormState } from "react-dom";
import { createProductSale } from "@/actions/product-sale";
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

export default function NewSalePage() {
    const [state, formAction] = useFormState(createProductSale, initialState);
    const router = useRouter();
    const [quantity, setQuantity] = useState("");
    const [pricePerUnit, setPricePerUnit] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("PENDING");
    const [paidAmount, setPaidAmount] = useState("");

    useEffect(() => {
        if (state.message && !state.message.includes("Failed")) {
            router.push("/dashboard/marketing/sales");
        }
    }, [state.message, router]);

    const totalPrice = (parseFloat(quantity) || 0) * (parseFloat(pricePerUnit) || 0);
    const dueAmount = totalPrice - (parseFloat(paidAmount) || 0);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/marketing/sales">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Record Product Sale</h2>
                    <p className="text-muted-foreground">Add a new product sale</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sale Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="productName">Product Name *</Label>
                                <Input
                                    id="productName"
                                    name="productName"
                                    placeholder="e.g., Steel Cabinet"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Product description"
                                    rows={2}
                                />
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
                                    placeholder="e.g., pieces, kg"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
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

                            <div className="col-span-2 border-t pt-4">
                                <h3 className="font-semibold mb-3">Customer Information</h3>
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input
                                    id="customerName"
                                    name="customerName"
                                    placeholder="Customer or company name"
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
                                <Label htmlFor="saleDate">Sale Date *</Label>
                                <Input
                                    id="saleDate"
                                    name="saleDate"
                                    type="date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="customerAddress">Customer Address</Label>
                                <Textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    placeholder="Delivery address"
                                    rows={2}
                                />
                            </div>

                            <div className="col-span-2 border-t pt-4">
                                <h3 className="font-semibold mb-3">Payment Details</h3>
                            </div>

                            <div>
                                <Label htmlFor="paymentStatus">Payment Status *</Label>
                                <Select
                                    name="paymentStatus"
                                    value={paymentStatus}
                                    onValueChange={setPaymentStatus}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="PARTIAL">Partial</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="paidAmount">Paid Amount</Label>
                                <Input
                                    id="paidAmount"
                                    name="paidAmount"
                                    type="number"
                                    step="0.01"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Additional notes"
                                    rows={2}
                                />
                            </div>

                            {(quantity && pricePerUnit) && (
                                <div className="col-span-2 p-4 bg-muted rounded-lg space-y-2">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Price:</span>
                                        <span>₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    {paidAmount && (
                                        <>
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Paid:</span>
                                                <span>₹{parseFloat(paidAmount).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-yellow-600 pt-2 border-t">
                                                <span>Due:</span>
                                                <span>₹{dueAmount.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
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
                            <Button type="submit">Record Sale</Button>
                            <Link href="/dashboard/marketing/sales">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

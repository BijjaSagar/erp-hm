"use client";

import { useState, useTransition, useEffect } from "react";
import { generateInvoice, calculateGST, calculateTotal } from "@/actions/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, IndianRupee, Calculator } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormState {
    message: string;
    invoiceId?: string;
    invoiceNo?: string;
}

const initialState: FormState = {
    message: "",
};

export default function NewInvoiceForm({ orders }: { orders: any[] }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [amount, setAmount] = useState("");
    const [isGst, setIsGst] = useState(true);
    const [gstAmount, setGstAmount] = useState(0);
    const [total, setTotal] = useState(0);

    const selectedOrder = orders.find(o => o.id === selectedOrderId);

    useEffect(() => {
        const amountNum = parseFloat(amount) || 0;
        const calculatedGst = isGst ? calculateGST(amountNum) : 0;
        const calculatedTotal = calculateTotal(amountNum, isGst);

        setGstAmount(calculatedGst);
        setTotal(calculatedTotal);
    }, [amount, isGst]);

    const handleSubmit = (formData: FormData) => {
        if (!selectedOrderId) {
            setState({ message: "Please select an order" });
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setState({ message: "Please enter a valid amount" });
            return;
        }

        formData.append("orderId", selectedOrderId);
        formData.append("amount", amount);
        formData.append("isGst", isGst.toString());

        startTransition(async () => {
            const result = await generateInvoice(state, formData);
            setState(result as FormState);

            if (result.invoiceId) {
                setTimeout(() => {
                    router.push(`/dashboard/invoices/${result.invoiceId}`);
                }, 1000);
            }
        });
    };

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/invoices">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground mb-4">
                            No completed orders available for invoicing.
                        </p>
                        <Link href="/dashboard/orders">
                            <Button variant="outline">
                                View Orders
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="orderId">Select Order *</Label>
                                <Select
                                    value={selectedOrderId}
                                    onValueChange={setSelectedOrderId}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select completed order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orders.map((order) => (
                                            <SelectItem key={order.id} value={order.id}>
                                                {order.orderNumber} - {order.customerName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedOrder && (
                                <Card className="bg-slate-50 border-2">
                                    <CardContent className="pt-6">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Customer:</span>
                                                <span className="font-medium">{selectedOrder.customerName}</span>
                                            </div>
                                            {selectedOrder.customerPhone && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Phone:</span>
                                                    <span className="font-medium">{selectedOrder.customerPhone}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Items:</span>
                                                <span className="font-medium">{selectedOrder.items.length}</span>
                                            </div>
                                            {selectedOrder.branch && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Branch:</span>
                                                    <span className="font-medium">{selectedOrder.branch.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₹) *</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isGst"
                                    checked={isGst}
                                    onCheckedChange={(checked) => setIsGst(checked as boolean)}
                                />
                                <Label htmlFor="isGst" className="cursor-pointer">
                                    Include GST (18%)
                                </Label>
                            </div>

                            {/* Calculation Summary */}
                            {amount && parseFloat(amount) > 0 && (
                                <Card className="bg-blue-50 border-2 border-blue-200">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center text-blue-900">
                                            <Calculator className="mr-2 h-4 w-4" />
                                            Calculation Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Base Amount:</span>
                                            <span className="font-medium">
                                                ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {isGst && (
                                            <div className="flex justify-between text-sm">
                                                <span>GST (18%):</span>
                                                <span className="font-medium">
                                                    ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-base font-bold pt-2 border-t border-blue-300">
                                            <span>Total Amount:</span>
                                            <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {state?.message && (
                                <div className={`p-3 rounded-md text-sm text-center ${state.message.includes("successfully")
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                    {state.message}
                                    {state.invoiceNo && (
                                        <div className="mt-1 font-semibold">
                                            Invoice Number: {state.invoiceNo}
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
                                            Generating...
                                        </>
                                    ) : (
                                        "Generate Invoice"
                                    )}
                                </Button>
                                <Link href="/dashboard/invoices">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

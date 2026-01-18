"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IndianRupee, Save, X } from "lucide-react";
import { updateInvoice } from "@/actions/invoice";
import { calculateGST } from "@/lib/invoice-utils";

interface Invoice {
    id: string;
    invoiceNo: string;
    amount: number;
    gstAmount: number;
    isGst: boolean;
    status: string;
    order: {
        id: string;
        orderNumber: string;
        customerName: string;
        customerPhone: string | null;
    };
}

export default function EditInvoiceForm({ invoice }: { invoice: Invoice }) {
    const router = useRouter();
    const [amount, setAmount] = useState(invoice.amount);
    const [isGst, setIsGst] = useState(invoice.isGst);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const gstAmount = isGst ? calculateGST(amount) : 0;
    const total = amount + gstAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("amount", amount.toString());
            formData.append("isGst", isGst.toString());

            const result = await updateInvoice(invoice.id, null, formData);

            if (result.message === "Invoice updated successfully") {
                router.push(`/dashboard/invoices/${invoice.id}`);
            } else {
                setError(result.message || "Failed to update invoice");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Invoice Number</Label>
                            <p className="font-medium">{invoice.invoiceNo}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Order Number</Label>
                            <p className="font-medium">{invoice.order.orderNumber}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Customer Name</Label>
                            <p className="font-medium">{invoice.order.customerName}</p>
                        </div>
                        {invoice.order.customerPhone && (
                            <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-medium">{invoice.order.customerPhone}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="amount">Amount *</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isGst"
                                checked={isGst}
                                onCheckedChange={setIsGst}
                            />
                            <Label htmlFor="isGst">Include GST (18%)</Label>
                        </div>

                        {isGst && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                                <div className="flex justify-between text-sm">
                                    <span>Base Amount:</span>
                                    <span className="flex items-center">
                                        <IndianRupee className="h-3 w-3 mr-1" />
                                        {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span>GST (18%):</span>
                                    <span className="flex items-center">
                                        <IndianRupee className="h-3 w-3 mr-1" />
                                        {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-blue-300">
                                    <span>Total Amount:</span>
                                    <span className="flex items-center">
                                        <IndianRupee className="h-3 w-3 mr-1" />
                                        {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "Updating..." : "Update Invoice"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

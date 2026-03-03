"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Truck, Loader2, FileText, CheckCircle2, ArrowRight, IndianRupee, Calculator } from "lucide-react";
import { generateInvoice } from "@/actions/invoice";
import { transferFromProduction } from "@/actions/stock-transfer";
import { useRouter } from "next/navigation";

interface BillAndTransferButtonProps {
    order: {
        id: string;
        orderNumber: string;
        customerName: string;
        customerPhone?: string | null;
        items: Array<{
            id: string;
            productName: string;
            quantity: number;
        }>;
    };
    stores: Array<{
        id: string;
        name: string;
        address: string | null;
    }>;
    label?: string;
}

function calculateGST(amount: number): number {
    return parseFloat((amount * 0.18).toFixed(2));
}

export function BillAndTransferButton({ order, stores, label }: BillAndTransferButtonProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [invoiceId, setInvoiceId] = useState<string | null>(null);
    const [invoiceNo, setInvoiceNo] = useState<string | null>(null);

    // Step 1 – Bill fields
    const [amount, setAmount] = useState("");
    const [isGst, setIsGst] = useState(true);
    const [gstAmount, setGstAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [billError, setBillError] = useState("");

    // Step 2 – Transfer fields
    const [selectedStore, setSelectedStore] = useState("");
    const [transferError, setTransferError] = useState("");

    const router = useRouter();

    useEffect(() => {
        const amountNum = parseFloat(amount) || 0;
        const gst = isGst ? calculateGST(amountNum) : 0;
        setGstAmount(gst);
        setTotal(parseFloat((amountNum + gst).toFixed(2)));
    }, [amount, isGst]);

    // Reset state when dialog closes
    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        if (!val) {
            setStep(1);
            setAmount("");
            setIsGst(true);
            setBillError("");
            setTransferError("");
            setSelectedStore("");
            setInvoiceId(null);
            setInvoiceNo(null);
        }
    };

    // Step 1 – Generate Invoice
    const handleGenerateBill = async () => {
        setBillError("");
        if (!amount || parseFloat(amount) <= 0) {
            setBillError("Please enter a valid amount.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("orderId", order.id);
            formData.append("amount", amount);
            formData.append("isGst", isGst.toString());

            const result = await generateInvoice(null, formData);

            if (result.invoiceId) {
                setInvoiceId(result.invoiceId);
                setInvoiceNo(result.invoiceNo ?? null);
                setStep(2);
            } else {
                setBillError(result.message || "Failed to generate invoice.");
            }
        } catch {
            setBillError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2 – Transfer to HM1
    const handleTransfer = async () => {
        setTransferError("");
        if (!selectedStore) {
            setTransferError("Please select a destination store.");
            return;
        }

        setLoading(true);
        try {
            const items = order.items.map((item) => ({
                productName: item.productName,
                sku: `SKU-${item.id}`,
                quantity: item.quantity,
                unit: "pcs",
            }));

            const result = await transferFromProduction(order.id, selectedStore, items);

            if (result.message.includes("successfully")) {
                setOpen(false);
                router.push("/dashboard/stock-transfers");
                router.refresh();
            } else {
                setTransferError(result.message);
            }
        } catch {
            setTransferError("Failed to create transfer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (stores.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-medium"
                >
                    <Truck className="h-4 w-4 mr-2" />
                    {label || "Bill & Transfer"}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            <FileText className="h-3.5 w-3.5" />
                            Step 1: Generate Bill
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            <Truck className="h-3.5 w-3.5" />
                            Step 2: Transfer to HM1
                        </div>
                    </div>

                    <DialogTitle>
                        {step === 1 ? "Generate Bill" : "Transfer to HM1 Store"}
                    </DialogTitle>
                    <DialogDescription>
                        Order <span className="font-semibold">{order.orderNumber}</span> — {order.customerName}
                    </DialogDescription>
                </DialogHeader>

                {/* ─── Step 1: Bill ─── */}
                {step === 1 && (
                    <div className="space-y-4 py-2">
                        {/* Order summary */}
                        <div className="p-3 bg-slate-50 rounded-lg text-sm border">
                            <div className="font-medium text-slate-800">{order.orderNumber}</div>
                            <div className="text-muted-foreground">{order.customerName}{order.customerPhone && ` · ${order.customerPhone}`}</div>
                            <div className="text-muted-foreground">{order.items.length} item(s)</div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1.5">
                            <Label htmlFor="amount">Amount (₹) *</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Enter base amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* GST toggle */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isGst"
                                checked={isGst}
                                onCheckedChange={(v) => setIsGst(v as boolean)}
                            />
                            <Label htmlFor="isGst" className="cursor-pointer">
                                Include GST (18%)
                            </Label>
                        </div>

                        {/* Calculation summary */}
                        {amount && parseFloat(amount) > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5 text-sm">
                                <div className="flex items-center gap-1.5 text-blue-800 font-semibold mb-2">
                                    <Calculator className="h-4 w-4" />
                                    Calculation Summary
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Base Amount:</span>
                                    <span className="font-medium">₹{parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                                {isGst && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">GST (18%):</span>
                                        <span className="font-medium">₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-base border-t border-blue-300 pt-1.5 mt-1">
                                    <span>Total:</span>
                                    <span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        )}

                        {billError && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{billError}</p>
                        )}
                    </div>
                )}

                {/* ─── Step 2: Transfer ─── */}
                {step === 2 && (
                    <div className="space-y-4 py-2">
                        {/* Invoice success */}
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-green-800">Bill Generated Successfully!</p>
                                <p className="text-green-700">Invoice No: <span className="font-mono font-bold">{invoiceNo}</span></p>
                            </div>
                        </div>

                        {/* Order summary */}
                        <div className="p-3 bg-slate-50 rounded-lg text-sm border">
                            <div className="font-medium">{order.orderNumber} · {order.items.length} item(s)</div>
                            <div className="text-muted-foreground">{order.customerName}</div>
                        </div>

                        {/* Store selection */}
                        <div className="space-y-1.5">
                            <Label htmlFor="store">Select Destination Store *</Label>
                            <select
                                id="store"
                                className="w-full p-2 border rounded-md text-sm bg-white"
                                value={selectedStore}
                                onChange={(e) => setSelectedStore(e.target.value)}
                            >
                                <option value="">Choose a store...</option>
                                {stores.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.name}{store.address && ` — ${store.address}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {transferError && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{transferError}</p>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>

                    {step === 1 && (
                        <Button
                            onClick={handleGenerateBill}
                            disabled={!amount || parseFloat(amount) <= 0 || loading}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Bill & Continue
                                </>
                            )}
                        </Button>
                    )}

                    {step === 2 && (
                        <Button
                            onClick={handleTransfer}
                            disabled={!selectedStore || loading}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Transferring...
                                </>
                            ) : (
                                <>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Transfer to HM1
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

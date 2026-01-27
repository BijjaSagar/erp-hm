"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createContraEntry } from "@/actions/contra-entry";
import { Loader2 } from "lucide-react";

interface Store {
    id: string;
    name: string;
    code: string;
}

interface ContraEntryFormProps {
    stores: Store[];
}

export function ContraEntryForm({ stores }: ContraEntryFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        transactionType: "DEPOSIT",
        fromAccount: "",
        toAccount: "",
        amount: "",
        chequeNumber: "",
        chequeDate: "",
        bankName: "",
        description: "",
        storeId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createContraEntry({
                transactionType: formData.transactionType as "DEPOSIT" | "WITHDRAWAL",
                fromAccount: formData.fromAccount,
                toAccount: formData.toAccount,
                amount: parseFloat(formData.amount),
                chequeNumber: formData.chequeNumber,
                chequeDate: formData.chequeDate ? new Date(formData.chequeDate) : undefined,
                bankName: formData.bankName,
                description: formData.description,
                storeId: formData.storeId,
            });

            if (result.success) {
                alert("Contra entry created successfully!");
                // Reset form
                setFormData({
                    transactionType: "DEPOSIT",
                    fromAccount: "",
                    toAccount: "",
                    amount: "",
                    chequeNumber: "",
                    chequeDate: "",
                    bankName: "",
                    description: "",
                    storeId: "",
                });
                router.refresh();
            } else {
                alert(result.error || "Failed to create contra entry");
            }
        } catch (error) {
            alert("An error occurred while creating the contra entry");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select
                    value={formData.transactionType}
                    onValueChange={(value) =>
                        setFormData({ ...formData, transactionType: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DEPOSIT">Cheque Deposit</SelectItem>
                        <SelectItem value="WITHDRAWAL">Cheque Withdrawal</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="storeId">Store</Label>
                <Select
                    value={formData.storeId}
                    onValueChange={(value) =>
                        setFormData({ ...formData, storeId: value })
                    }
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                        {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                                {store.name} ({store.code})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fromAccount">From Account</Label>
                    <Input
                        id="fromAccount"
                        value={formData.fromAccount}
                        onChange={(e) =>
                            setFormData({ ...formData, fromAccount: e.target.value })
                        }
                        placeholder={
                            formData.transactionType === "DEPOSIT"
                                ? "Cash Account"
                                : "Bank Account"
                        }
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="toAccount">To Account</Label>
                    <Input
                        id="toAccount"
                        value={formData.toAccount}
                        onChange={(e) =>
                            setFormData({ ...formData, toAccount: e.target.value })
                        }
                        placeholder={
                            formData.transactionType === "DEPOSIT"
                                ? "Bank Account"
                                : "Cash Account"
                        }
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="chequeNumber">Cheque Number</Label>
                    <Input
                        id="chequeNumber"
                        value={formData.chequeNumber}
                        onChange={(e) =>
                            setFormData({ ...formData, chequeNumber: e.target.value })
                        }
                        placeholder="CHQ123456"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="chequeDate">Cheque Date</Label>
                    <Input
                        id="chequeDate"
                        type="date"
                        value={formData.chequeDate}
                        onChange={(e) =>
                            setFormData({ ...formData, chequeDate: e.target.value })
                        }
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                    }
                    placeholder="e.g., HDFC Bank"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Additional notes about this transaction"
                    rows={3}
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Entry...
                    </>
                ) : (
                    "Create Contra Entry"
                )}
            </Button>
        </form>
    );
}

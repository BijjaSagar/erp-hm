"use client";

import { useState, useTransition } from "react";
import { updateOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";

interface FormState {
    message: string;
}

const initialState: FormState = {
    message: "",
};

export default function EditOrderForm({ order, branches }: { order: any; branches: any[] }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await updateOrder(order.id, state, formData);
            setState(result as FormState);

            if (result.message.includes("successfully")) {
                setTimeout(() => {
                    router.push(`/dashboard/orders/${order.id}`);
                }, 1000);
            }
        });
    };

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href={`/dashboard/orders/${order.id}`}>
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
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name *</Label>
                                    <Input
                                        id="customerName"
                                        name="customerName"
                                        defaultValue={order.customerName}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Phone Number</Label>
                                    <Input
                                        id="customerPhone"
                                        name="customerPhone"
                                        type="tel"
                                        defaultValue={order.customerPhone || ""}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerAddress">Address</Label>
                                <Textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    defaultValue={order.customerAddress || ""}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select name="status" defaultValue={order.status}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                                            <SelectItem value={OrderStatus.APPROVED}>Approved</SelectItem>
                                            <SelectItem value={OrderStatus.IN_PRODUCTION}>In Production</SelectItem>
                                            <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
                                            <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                                            <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="branchId">Branch</Label>
                                    <Select name="branchId" defaultValue={order.branchId || ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id}>
                                                    {branch.name} ({branch.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {state?.message && (
                            <div className={`p-3 rounded-md text-sm text-center ${state.message.includes("successfully")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}>
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
                                        Updating...
                                    </>
                                ) : (
                                    "Update Order"
                                )}
                            </Button>
                            <Link href={`/dashboard/orders/${order.id}`}>
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

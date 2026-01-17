"use client";

import { useState, useTransition } from "react";
import { updateStore } from "@/actions/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormState {
    message: string;
}

const initialState: FormState = {
    message: "",
};

export default function EditStoreForm({ store, users }: { store: any; users: any[] }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();
    const [isActive, setIsActive] = useState(store.isActive);

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            formData.set("isActive", isActive.toString());
            const result = await updateStore(store.id, state, formData);
            setState(result as FormState);

            if (result.message.includes("successfully")) {
                setTimeout(() => {
                    router.push(`/dashboard/stores/${store.id}`);
                }, 1000);
            }
        });
    };

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href={`/dashboard/stores/${store.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Store Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={store.name}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Store Code *</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        defaultValue={store.code}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    defaultValue={store.address}
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        defaultValue={store.phone || ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={store.email || ""}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gstNumber">GST Number</Label>
                                    <Input
                                        id="gstNumber"
                                        name="gstNumber"
                                        defaultValue={store.gstNumber || ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="managerId">Store Manager</Label>
                                    <Select name="managerId" defaultValue={store.managerId || ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                                <Label htmlFor="isActive">Store is Active</Label>
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
                                    "Update Store"
                                )}
                            </Button>
                            <Link href={`/dashboard/stores/${store.id}`}>
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

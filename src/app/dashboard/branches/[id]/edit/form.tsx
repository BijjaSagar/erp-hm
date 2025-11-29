"use client";

import { useState, useTransition } from "react";
import { updateBranch } from "@/actions/branch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Branch } from "@prisma/client";

interface FormState {
    message: string;
    errors?: {
        name?: string[];
        code?: string[];
        address?: string[];
    };
}

const initialState: FormState = {
    message: "",
};

export default function EditBranchForm({ branch }: { branch: Branch }) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await updateBranch(branch.id, state, formData);
            setState(result as FormState);

            if (result.message === "Success") {
                router.push("/dashboard/branches");
            }
        });
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Branch Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Head Office"
                                defaultValue={branch.name}
                                required
                            />
                            {state.errors?.name && (
                                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Branch Code</Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="e.g. HO"
                                defaultValue={branch.code}
                                required
                            />
                            {state.errors?.code && (
                                <p className="text-sm text-red-500">{state.errors.code[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Full address"
                                defaultValue={branch.address}
                                required
                            />
                            {state.errors?.address && (
                                <p className="text-sm text-red-500">{state.errors.address[0]}</p>
                            )}
                        </div>
                    </div>

                    {state.message && state.message !== "Success" && (
                        <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm text-center">
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
                                "Update Branch"
                            )}
                        </Button>
                        <Link href="/dashboard/branches">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

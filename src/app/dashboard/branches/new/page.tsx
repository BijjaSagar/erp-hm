"use client";

import { useState, useTransition } from "react";
import { createBranch } from "@/actions/branch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    errors: {},
};

export default function NewBranchPage() {
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await createBranch(state, formData);
            setState(result as FormState);
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/branches">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold tracking-tight">Add New Branch</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Branch Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Branch Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Pune Main Factory" required />
                            {state?.errors?.name && (
                                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Branch Code</Label>
                            <Input id="code" name="code" placeholder="e.g. PN-01" required />
                            {state?.errors?.code && (
                                <p className="text-sm text-red-500">{state.errors.code[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" placeholder="Full address" required />
                            {state?.errors?.address && (
                                <p className="text-sm text-red-500">{state.errors.address[0]}</p>
                            )}
                        </div>

                        {state?.message && (
                            <div className={`p-3 rounded-md text-sm ${state.message === "Success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {state.message === "Success" ? "Branch created successfully!" : state.message}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Branch"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

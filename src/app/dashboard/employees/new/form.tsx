"use client";

import { useState, useTransition } from "react";
import { createEmployee } from "@/actions/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FormState {
    message: string;
    errors?: {
        name?: string[];
        designation?: string[];
        phone?: string[];
        branchId?: string[];
    };
}

const initialState: FormState = {
    message: "",
    errors: {},
};

export default function NewEmployeeForm({ branches }: { branches: any[] }) {
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await createEmployee(state, formData);
            setState(result as FormState);
        });
    };

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/employees">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Rajesh Kumar" required />
                            {state?.errors?.name && (
                                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Select name="designation" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                                    <SelectItem value="Operator">Operator</SelectItem>
                                    <SelectItem value="Helper">Helper</SelectItem>
                                </SelectContent>
                            </Select>
                            {state?.errors?.designation && (
                                <p className="text-sm text-red-500">{state.errors.designation[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branchId">Branch</Label>
                            <Select name="branchId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state?.errors?.branchId && (
                                <p className="text-sm text-red-500">{state.errors.branchId[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" placeholder="+91 98765 43210" />
                            {state?.errors?.phone && (
                                <p className="text-sm text-red-500">{state.errors.phone[0]}</p>
                            )}
                        </div>

                        {state?.message && (
                            <div className={`p-3 rounded-md text-sm ${state.message === "Success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {state.message === "Success" ? "Employee created successfully!" : state.message}
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
                                    "Create Employee"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

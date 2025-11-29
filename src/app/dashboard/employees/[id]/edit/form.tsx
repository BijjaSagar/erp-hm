"use client";

import { useState, useTransition } from "react";
import { updateEmployee } from "@/actions/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Branch, Employee } from "@prisma/client";

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
};

interface EditEmployeeFormProps {
    employee: Employee & { branch: Branch };
    branches: Branch[];
}

export default function EditEmployeeForm({ employee, branches }: EditEmployeeFormProps) {
    const router = useRouter();
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await updateEmployee(employee.id, state, formData);
            setState(result as FormState);

            if (result.message === "Success") {
                router.push("/dashboard/employees");
            }
        });
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                defaultValue={employee.name}
                                required
                            />
                            {state.errors?.name && (
                                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input
                                id="designation"
                                name="designation"
                                placeholder="e.g. Supervisor"
                                defaultValue={employee.designation}
                                required
                            />
                            {state.errors?.designation && (
                                <p className="text-sm text-red-500">{state.errors.designation[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="+91..."
                                defaultValue={employee.phone || ""}
                            />
                            {state.errors?.phone && (
                                <p className="text-sm text-red-500">{state.errors.phone[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branchId">Branch</Label>
                            <Select name="branchId" defaultValue={employee.branchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            {branch.name} ({branch.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state.errors?.branchId && (
                                <p className="text-sm text-red-500">{state.errors.branchId[0]}</p>
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
                                "Update Employee"
                            )}
                        </Button>
                        <Link href="/dashboard/employees">
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

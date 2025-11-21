'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Checkbox } from "@/components/ui/checkbox";
import { createMachine, updateMachine } from './actions';
import { machineSchema, MachineData } from './schema';
import { ProductionStage } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';



interface MachineFormProps {
    machine?: any;
    branches: { id: string; name: string; code: string }[];
    onSuccess?: () => void;
}

export function MachineForm({ machine, branches, onSuccess }: MachineFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<MachineData>({
        resolver: zodResolver(machineSchema) as any,
        defaultValues: {
            name: machine?.name || '',
            code: machine?.code || '',
            stage: machine?.stage || ProductionStage.CUTTING,
            capacity: machine?.capacity || undefined,
            branchId: machine?.branchId || (branches.length > 0 ? branches[0].id : ''),
            isActive: machine?.isActive ?? true,
        },
    });

    const onSubmit = (data: MachineData) => {
        setError(null);
        startTransition(async () => {
            try {
                let result;
                if (machine) {
                    result = await updateMachine(machine.id, data);
                } else {
                    result = await createMachine(data);
                }

                if (result.error) {
                    setError(result.error);
                } else {
                    form.reset();
                    router.refresh();
                    if (onSuccess) onSuccess();
                }
            } catch (e) {
                setError("An unexpected error occurred");
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Machine Name</Label>
                    <Input id="name" {...form.register("name")} placeholder="e.g. Cutting Machine 1" />
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Machine Code</Label>
                    <Input id="code" {...form.register("code")} placeholder="e.g. CUT-01" />
                    {form.formState.errors.code && (
                        <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stage">Production Stage</Label>
                    <Select
                        onValueChange={(value) => form.setValue("stage", value as ProductionStage)}
                        defaultValue={form.getValues("stage")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(ProductionStage).map((stage) => (
                                <SelectItem key={stage} value={stage}>
                                    {stage.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.stage && (
                        <p className="text-sm text-red-500">{form.formState.errors.stage.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="branchId">Branch</Label>
                    <Select
                        onValueChange={(value) => form.setValue("branchId", value)}
                        defaultValue={form.getValues("branchId")}
                    >
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
                    {form.formState.errors.branchId && (
                        <p className="text-sm text-red-500">{form.formState.errors.branchId.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Units/Hour) - Optional</Label>
                <Input
                    id="capacity"
                    type="number"
                    {...form.register("capacity")}
                    placeholder="e.g. 100"
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="isActive"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked as boolean)}
                />
                <Label htmlFor="isActive">Active Machine</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {machine ? 'Update Machine' : 'Create Machine'}
                </Button>
            </div>
        </form>
    );
}

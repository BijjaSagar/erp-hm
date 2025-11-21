'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Wrench, Loader2 } from "lucide-react";
import { reportMachineIssue } from './machine-actions';
import { useRouter } from 'next/navigation';
import { MachineState, Priority, ProductionStage } from '@prisma/client';

export function MachineIssueForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [machineName, setMachineName] = useState('');
    const [status, setStatus] = useState<MachineState | ''>('');
    const [issue, setIssue] = useState('');
    const [priority, setPriority] = useState<Priority | ''>('');
    const [stage, setStage] = useState<ProductionStage | ''>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!machineName || !status || !issue || !priority || !stage) {
            setError("Please fill in all fields");
            return;
        }

        setError(null);
        startTransition(async () => {
            try {
                const result = await reportMachineIssue({
                    machineName,
                    status: status as MachineState,
                    issue,
                    priority: priority as Priority,
                    stage: stage as ProductionStage
                });

                if (result.error) {
                    setError(result.error);
                } else {
                    setSuccess(true);
                    // Reset form
                    setMachineName('');
                    setStatus('');
                    setIssue('');
                    setPriority('');
                    setStage('');
                    setTimeout(() => {
                        setSuccess(false);
                        router.refresh();
                    }, 2000);
                }
            } catch (e) {
                setError("Failed to report machine issue");
            }
        });
    };

    const stages = [
        { value: 'CUTTING', label: 'Cutting' },
        { value: 'SHAPING', label: 'Shaping' },
        { value: 'BENDING', label: 'Bending' },
        { value: 'WELDING_INNER', label: 'Welding Inner' },
        { value: 'WELDING_OUTER', label: 'Welding Outer' },
        { value: 'GRINDING', label: 'Grinding' },
        { value: 'FINISHING', label: 'Finishing' },
        { value: 'PAINTING', label: 'Painting' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Report Machine Issue
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
                            Machine issue reported successfully!
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="machineName">Machine Name</Label>
                            <Input
                                id="machineName"
                                value={machineName}
                                onChange={(e) => setMachineName(e.target.value)}
                                placeholder="e.g., Cutting Machine 01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stage">Production Stage</Label>
                            <Select onValueChange={(value) => setStage(value as ProductionStage)} value={stage}>
                                <SelectTrigger id="stage">
                                    <SelectValue placeholder="Select stage..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Machine Status</Label>
                            <Select onValueChange={(value) => setStatus(value as MachineState)} value={status}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STUCK">Stuck</SelectItem>
                                    <SelectItem value="MAINTENANCE">Needs Maintenance</SelectItem>
                                    <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                                    <SelectItem value="OPERATIONAL">Operational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select onValueChange={(value) => setPriority(value as Priority)} value={priority}>
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="issue">Issue Description</Label>
                        <Textarea
                            id="issue"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            placeholder="Describe the machine issue in detail..."
                            rows={4}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reporting Issue...
                            </>
                        ) : (
                            "Report Issue"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

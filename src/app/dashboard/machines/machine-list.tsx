'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { MachineForm } from './machine-form';
import { deleteMachine } from './actions';
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';

interface MachineListProps {
    machines: any[];
    branches: any[];
}

export function MachineList({ machines, branches }: MachineListProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<any>(null);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this machine?')) {
            await deleteMachine(id);
            router.refresh();
        }
    };

    const handleEdit = (machine: any) => {
        setEditingMachine(machine);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingMachine(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        setIsDialogOpen(false);
        setEditingMachine(null);
        router.refresh();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Machines</h2>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add Machine
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingMachine ? 'Edit Machine' : 'Add New Machine'}</DialogTitle>
                        <DialogDescription>
                            {editingMachine
                                ? 'Update the machine details below.'
                                : 'Enter the details for the new machine.'}
                        </DialogDescription>
                    </DialogHeader>
                    <MachineForm
                        machine={editingMachine}
                        branches={branches}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {machines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No machines found. Add your first machine.
                                </TableCell>
                            </TableRow>
                        ) : (
                            machines.map((machine) => (
                                <TableRow key={machine.id}>
                                    <TableCell className="font-medium">{machine.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{machine.code}</Badge>
                                    </TableCell>
                                    <TableCell>{machine.stage.replace(/_/g, ' ')}</TableCell>
                                    <TableCell>{machine.branch.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={machine.isActive ? "default" : "secondary"}>
                                            {machine.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(machine)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => handleDelete(machine.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

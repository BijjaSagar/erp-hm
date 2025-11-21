'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { startProductionSession } from './production-actions';
import { Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MachineSelectorProps {
    machines: any[];
    orders: any[];
}

export function MachineSelector({ machines, orders }: MachineSelectorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedMachine, setSelectedMachine] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleStartSession = () => {
        if (!selectedMachine || !selectedOrder) {
            setError("Please select both a machine and an order");
            return;
        }

        setError(null);
        startTransition(async () => {
            try {
                const result = await startProductionSession(selectedMachine, selectedOrder);
                if (result.error) {
                    setError(result.error);
                } else {
                    router.refresh();
                }
            } catch (e) {
                setError("Failed to start session");
            }
        });
    };

    // Filter orders based on selected machine's stage if possible
    // For now, show all assigned orders

    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center text-blue-700">
                    <Play className="mr-2 h-5 w-5" />
                    Start Production
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="machine">Select Machine</Label>
                        <Select onValueChange={setSelectedMachine} value={selectedMachine}>
                            <SelectTrigger id="machine" className="bg-white">
                                <SelectValue placeholder="Choose machine..." />
                            </SelectTrigger>
                            <SelectContent>
                                {machines.length === 0 ? (
                                    <SelectItem value="none" disabled>No machines assigned</SelectItem>
                                ) : (
                                    machines.map((machine) => (
                                        <SelectItem key={machine.id} value={machine.id}>
                                            {machine.name} ({machine.code})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="order">Select Order</Label>
                        <Select onValueChange={setSelectedOrder} value={selectedOrder}>
                            <SelectTrigger id="order" className="bg-white">
                                <SelectValue placeholder="Choose order..." />
                            </SelectTrigger>
                            <SelectContent>
                                {orders.length === 0 ? (
                                    <SelectItem value="none" disabled>No active orders</SelectItem>
                                ) : (
                                    orders.map((order) => (
                                        <SelectItem key={order.id} value={order.id}>
                                            {order.orderNumber} - {order.customerName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleStartSession}
                    disabled={isPending || !selectedMachine || !selectedOrder}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting Session...
                        </>
                    ) : (
                        "Start Production Session"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

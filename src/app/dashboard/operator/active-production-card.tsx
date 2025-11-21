'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Settings, Box, AlertTriangle, Info } from 'lucide-react';
import { endProductionSession, getProductionInput } from './production-actions';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialConsumptionForm } from './material-consumption-form';
import { Alert, AlertDescription } from "@/components/ui/ui-alert";

interface ActiveProductionCardProps {
    session: any;
}

export function ActiveProductionCard({ session }: ActiveProductionCardProps) {
    const router = useRouter();
    const [elapsed, setElapsed] = useState<string>('00:00:00');
    const [isEnding, setIsEnding] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state for ending session
    const [outputQty, setOutputQty] = useState(0);
    const [wastageQty, setWastageQty] = useState(0);
    const [rejectedQty, setRejectedQty] = useState(0);
    const [materialsUsed, setMaterialsUsed] = useState<any[]>([]);

    // Input tracking
    const [availableInput, setAvailableInput] = useState<number>(0);
    const [isFirstStage, setIsFirstStage] = useState(false);
    const [loadingInput, setLoadingInput] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const start = new Date(session.startTime).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsed(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [session.startTime]);

    useEffect(() => {
        if (isDialogOpen) {
            setLoadingInput(true);
            getProductionInput(session.orderId, session.stage).then(result => {
                if (result && typeof result.inputQuantity === 'number') {
                    setAvailableInput(result.inputQuantity);
                    setIsFirstStage(!!result.isFirstStage);
                }
                setLoadingInput(false);
            });
        }
    }, [isDialogOpen, session.orderId, session.stage]);

    const handleEndSession = async () => {
        const totalOutput = outputQty + wastageQty + rejectedQty;

        if (!isFirstStage && totalOutput > availableInput) {
            if (!confirm(`Total output (${totalOutput}) exceeds available input (${availableInput}). Are you sure?`)) {
                return;
            }
        }

        setIsEnding(true);
        try {
            await endProductionSession(session.id, {
                inputQuantity: isFirstStage ? totalOutput : Math.min(totalOutput, availableInput), // Logic can be refined
                outputQuantity: outputQty,
                wastageQuantity: wastageQty,
                rejectedQuantity: rejectedQty,
                materialsUsed
            });
            setIsDialogOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to end session", error);
            setIsEnding(false);
        }
    };

    return (
        <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium flex items-center text-green-700">
                        <Settings className="mr-2 h-5 w-5 animate-spin-slow" />
                        Production In Progress
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 animate-pulse">
                        Active
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Machine</p>
                        <p className="font-medium text-lg">{session.machine.name}</p>
                        <p className="text-xs text-muted-foreground">{session.machine.code}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Order</p>
                        <p className="font-medium text-lg">{session.order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{session.order.customerName}</p>
                    </div>
                </div>

                <div className="flex items-center justify-center py-4 bg-white/50 rounded-lg border border-green-100">
                    <Clock className="mr-3 h-6 w-6 text-green-600" />
                    <span className="text-3xl font-mono font-bold text-green-700">{elapsed}</span>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                            End Production Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>End Production Session</DialogTitle>
                            <DialogDescription>
                                Enter production output details to complete this session.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {!loadingInput && !isFirstStage && (
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-700">
                                        Available Input from previous stage: <strong>{availableInput} units</strong>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Output (Good)</Label>
                                    <Input
                                        type="number"
                                        value={outputQty}
                                        onChange={(e) => setOutputQty(Number(e.target.value))}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rejected (Defects)</Label>
                                    <Input
                                        type="number"
                                        value={rejectedQty}
                                        onChange={(e) => setRejectedQty(Number(e.target.value))}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Wastage (Scrap)</Label>
                                    <Input
                                        type="number"
                                        value={wastageQty}
                                        onChange={(e) => setWastageQty(Number(e.target.value))}
                                        min={0}
                                    />
                                </div>
                            </div>

                            <MaterialConsumptionForm
                                stage={session.stage}
                                onChange={setMaterialsUsed}
                            />
                        </div>

                        <Button
                            onClick={handleEndSession}
                            disabled={isEnding}
                            className="w-full"
                        >
                            {isEnding ? 'Ending Session...' : 'Confirm & End Session'}
                        </Button>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

'use client';

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startBreak, endBreak } from "./break-actions";
import { useRouter } from "next/navigation";
import { Coffee, Pause, Play } from "lucide-react";

interface BreakTimerProps {
    activeBreak?: {
        id: string;
        startTime: Date;
        reason?: string | null;
    } | null;
}

export function BreakTimer({ activeBreak }: BreakTimerProps) {
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [isPending, startTransition] = useTransition();

    // Optimistic state for break
    const [optimisticBreak, setOptimisticBreak] = useState<{
        id: string;
        startTime: Date;
        reason?: string | null;
    } | null>(null);

    const router = useRouter();

    // Use optimistic break if available, otherwise use server break
    const currentBreak = optimisticBreak || activeBreak;

    useEffect(() => {
        if (currentBreak) {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const start = new Date(currentBreak.startTime).getTime();
                setElapsed(Math.floor((now - start) / 1000));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentBreak]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartBreak = async () => {
        setIsLoading(true);

        // Optimistically show break started
        const tempBreak = {
            id: 'temp-' + Date.now(),
            startTime: new Date(),
            reason: reason || null
        };
        setOptimisticBreak(tempBreak);

        const result = await startBreak(reason || undefined);
        setIsLoading(false);

        if (result.success) {
            setReason("");
            // Update with real break data
            startTransition(() => {
                router.refresh();
            });
            // Clear optimistic state after refresh
            setTimeout(() => setOptimisticBreak(null), 1000);
        } else {
            // Revert optimistic update on error
            setOptimisticBreak(null);
            alert(result.error || "Failed to start break");
        }
    };

    const handleEndBreak = async () => {
        if (!currentBreak) return;

        setIsLoading(true);

        // Optimistically clear break
        setOptimisticBreak(null);

        const result = await endBreak(activeBreak?.id || currentBreak.id);
        setIsLoading(false);

        if (result.success) {
            startTransition(() => {
                router.refresh();
            });
        } else {
            // Revert optimistic update on error
            setOptimisticBreak(currentBreak);
            alert(result.error || "Failed to end break");
        }
    };

    if (currentBreak) {
        return (
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Pause className="h-5 w-5" />
                        Break in Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-orange-600 mb-2">
                            {formatTime(elapsed)}
                        </div>
                        {currentBreak.reason && (
                            <p className="text-sm text-muted-foreground">
                                Reason: {currentBreak.reason}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={handleEndBreak}
                        disabled={isLoading || isPending}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        size="lg"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        {isLoading ? "Ending..." : "End Break"}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    Start Break
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Input
                        id="reason"
                        placeholder="e.g., Lunch, Tea break, etc."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <Button
                    onClick={handleStartBreak}
                    disabled={isLoading || isPending}
                    className="w-full"
                    size="lg"
                >
                    <Pause className="h-4 w-4 mr-2" />
                    {isLoading ? "Starting..." : "Start Break"}
                </Button>
            </CardContent>
        </Card>
    );
}

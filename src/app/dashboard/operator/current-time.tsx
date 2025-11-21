'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface CurrentTimeProps {
    checkInTime?: string;
    checkedIn: boolean;
}

export function CurrentTimeDisplay({ checkInTime, checkedIn }: CurrentTimeProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className={checkedIn ? "border-green-200 bg-green-50" : "border-gray-200"}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Current Time
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-3xl font-bold">
                    {mounted ? formatTime(currentTime) : '--:--:--'}
                </div>
                <div className="text-xs text-muted-foreground">
                    {mounted ? formatDate(currentTime) : 'Loading...'}
                </div>
                {checkedIn && checkInTime && (
                    <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-green-700">
                            ✓ Checked in at {checkInTime}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

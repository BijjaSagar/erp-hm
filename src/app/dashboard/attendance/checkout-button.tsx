"use client";

import { useState } from "react";
import { checkOutAttendance } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckOutButton({ attendanceId }: { attendanceId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCheckOut = async () => {
        setIsLoading(true);
        try {
            const result = await checkOutAttendance(attendanceId);
            if (result.message.includes("successfully")) {
                router.refresh();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to check out");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckOut}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Checking out...
                </>
            ) : (
                <>
                    <LogOut className="mr-1 h-3 w-3" />
                    Check Out
                </>
            )}
        </Button>
    );
}

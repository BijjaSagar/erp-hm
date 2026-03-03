"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { processAllSalaries } from "@/actions/salary";
import { useRouter } from "next/navigation";

export function ProcessPayrollButton({ month, year }: { month: number; year: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handle = async () => {
        setLoading(true);
        try {
            const result = await processAllSalaries(month, year);
            alert(result.message);
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handle}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {loading ? "Processing..." : "Process Payroll"}
        </Button>
    );
}

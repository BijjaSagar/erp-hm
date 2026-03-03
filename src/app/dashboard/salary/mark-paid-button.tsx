"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { markSalaryPaid } from "@/actions/salary";
import { useRouter } from "next/navigation";

export function MarkPaidButton({ salaryRecordId }: { salaryRecordId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handle = async () => {
        setLoading(true);
        try {
            await markSalaryPaid(salaryRecordId);
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button size="sm" variant="outline" onClick={handle} disabled={loading}
            className="text-green-700 border-green-300 hover:bg-green-50">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
            {loading ? "..." : "Mark Paid"}
        </Button>
    );
}

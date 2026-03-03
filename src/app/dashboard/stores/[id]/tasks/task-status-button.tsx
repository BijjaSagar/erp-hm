"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2 } from "lucide-react";
import { updateTaskStatus } from "@/actions/store-tasks";
import { useRouter } from "next/navigation";

export function TaskStatusButton({ task }: { task: any }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleNext = async () => {
        setLoading(true);
        const nextStatus = task.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED";
        try {
            await updateTaskStatus(task.id, nextStatus);
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    if (task.status === "COMPLETED") return null;

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            disabled={loading}
            className={task.status === "PENDING"
                ? "text-blue-700 border-blue-300 hover:bg-blue-50"
                : "text-green-700 border-green-300 hover:bg-green-50"}
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : task.status === "PENDING" ? (
                <><Play className="h-3.5 w-3.5 mr-1" /> Start</>
            ) : (
                <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete</>
            )}
        </Button>
    );
}

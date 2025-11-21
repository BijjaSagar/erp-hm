"use client";

import { useState, useTransition } from "react";
import { updateInvoiceStatus } from "@/actions/invoice";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2 } from "lucide-react";

const statuses = ["DRAFT", "SENT", "PAID", "CANCELLED"];

export default function UpdateStatusButton({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: string }) {
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (newStatus: string) => {
        startTransition(async () => {
            await updateInvoiceStatus(invoiceId, newStatus);
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            Update Status
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {statuses.map((status) => (
                    <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={status === currentStatus}
                    >
                        {status}
                        {status === currentStatus && " (Current)"}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

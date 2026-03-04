"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InvoiceClientButtons() {
    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    return (
        <div className="mb-6 flex items-center justify-between no-print">
            <Link href="/dashboard/pos">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to POS
                </Button>
            </Link>
            <div className="flex gap-2">
                <Button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
                <Button
                    variant="outline"
                    onClick={handlePrint}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
        </div>
    );
}

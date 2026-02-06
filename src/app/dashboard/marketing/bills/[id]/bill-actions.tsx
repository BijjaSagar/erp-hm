"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export function BillActions({ billId }: { billId: string }) {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        // TODO: Implement PDF download functionality
        alert("PDF download functionality will be implemented soon");
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
            </Button>
        </div>
    );
}

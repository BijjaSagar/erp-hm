import { getInvoiceById } from "@/actions/invoice";
import { notFound } from "next/navigation";
import EditInvoiceForm from "./edit-invoice-form";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
    const invoice = await getInvoiceById(params.id);

    if (!invoice) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Edit Invoice</h2>
                <p className="text-muted-foreground">Update invoice details</p>
            </div>

            <EditInvoiceForm invoice={invoice} />
        </div>
    );
}

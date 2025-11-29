export const dynamic = 'force-dynamic';

import { getBranchById } from "@/actions/branch";
import { notFound } from "next/navigation";
import EditBranchForm from "./form";

export default async function EditBranchPage({ params }: { params: { id: string } }) {
    const branch = await getBranchById(params.id);

    if (!branch) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Edit Branch
                </h2>
                <p className="text-muted-foreground">Update branch details</p>
            </div>
            <EditBranchForm branch={JSON.parse(JSON.stringify(branch))} />
        </div>
    );
}

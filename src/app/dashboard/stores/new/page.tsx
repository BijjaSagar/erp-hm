export const dynamic = 'force-dynamic';

import { createStore } from "@/actions/store";
import StoreForm from "./form";

export default async function NewStorePage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Create New Store
                </h2>
                <p className="text-muted-foreground">Add a new retail store or showroom</p>
            </div>
            <StoreForm />
        </div>
    );
}

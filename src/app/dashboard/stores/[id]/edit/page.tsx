export const dynamic = 'force-dynamic';

import { getStoreById } from "@/actions/store";
import { getUsers } from "@/actions/user";
import { notFound } from "next/navigation";
import EditStoreForm from "./form";

export default async function EditStorePage({ params }: { params: { id: string } }) {
    const [store, users] = await Promise.all([
        getStoreById(params.id),
        getUsers({ role: 'STORE_MANAGER' }),
    ]);

    if (!store) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Edit Store {store.name}
                </h2>
                <p className="text-muted-foreground">Update store information</p>
            </div>
            <EditStoreForm
                store={JSON.parse(JSON.stringify(store))}
                users={JSON.parse(JSON.stringify(users))}
            />
        </div>
    );
}

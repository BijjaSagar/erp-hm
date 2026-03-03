export const dynamic = 'force-dynamic';

import { getBranches } from "@/actions/branch";
import { getStores } from "@/actions/store";
import NewEmployeeForm from "./form";

export default async function NewEmployeePage() {
    const [branches, stores] = await Promise.all([
        getBranches(),
        getStores()
    ]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Add New Employee</h2>
            <NewEmployeeForm branches={branches} stores={stores} />
        </div>
    );
}

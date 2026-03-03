export const dynamic = 'force-dynamic';

import { getEmployeeById } from "@/actions/employee";
import { getBranches } from "@/actions/branch";
import { getStores } from "@/actions/store";
import { notFound } from "next/navigation";
import EditEmployeeForm from "./form";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
    const [employee, branches, stores] = await Promise.all([
        getEmployeeById(params.id),
        getBranches(),
        getStores(),
    ]);

    if (!employee) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Edit Employee
                </h2>
                <p className="text-muted-foreground">Update employee details</p>
            </div>
            <EditEmployeeForm
                employee={JSON.parse(JSON.stringify(employee))}
                branches={JSON.parse(JSON.stringify(branches))}
                stores={JSON.parse(JSON.stringify(stores))}
            />
        </div>
    );
}

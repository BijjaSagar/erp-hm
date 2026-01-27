import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AddCustomerForm } from "./add-customer-form";

export default async function NewCustomerPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "MARKETING_HEAD") {
        redirect("/dashboard");
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Add New Customer
                </h2>
                <p className="text-muted-foreground mt-1">
                    Create a new customer (party) record
                </p>
            </div>

            <AddCustomerForm />
        </div>
    );
}

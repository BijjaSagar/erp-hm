import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = session?.user?.role;

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar role={role} />
            </div>
            <main className="md:pl-72 h-full bg-slate-50">
                <div className="flex items-center p-4 md:hidden bg-slate-900 text-white">
                    <MobileSidebar role={role} />
                    <span className="font-bold ml-2">HM ERP</span>
                </div>
                <div className="p-8 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

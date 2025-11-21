export const dynamic = 'force-dynamic';

import { getEmployees } from "@/actions/employee";
import MarkAttendanceForm from "./form";

export default async function MarkAttendancePage() {
    const employees = await getEmployees();

    return (
        <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-center">Mark Attendance</h2>
            <MarkAttendanceForm employees={employees} />
        </div>
    );
}

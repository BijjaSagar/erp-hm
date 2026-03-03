"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { SalaryType, SalaryStatus, AdvanceType } from "@prisma/client";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── SALARY STRUCTURE (set base salary on employee) ───────────────────────────
export async function updateEmployeeSalary(
    employeeId: string,
    salaryType: SalaryType,
    baseSalary: number
) {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        return { message: "Unauthorized" };
    }
    try {
        await prisma.employee.update({
            where: { id: employeeId },
            data: { salaryType, baseSalary },
        });
        revalidatePath("/dashboard/salary");
        revalidatePath("/dashboard/employees");
        return { message: "Salary structure updated successfully" };
    } catch (error) {
        console.error("Error updating salary:", error);
        return { message: "Failed to update salary structure" };
    }
}

// ─── PROCESS MONTHLY PAYROLL ────────────────────────────────────────────────────
export async function processMonthlySalary(employeeId: string, month: number, year: number) {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        return { message: "Unauthorized" };
    }

    try {
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return { message: "Employee not found" };
        if (employee.baseSalary === 0) return { message: "Employee salary not configured" };

        // Count attendance for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                employeeId,
                checkIn: { gte: startDate, lte: endDate },
            },
        });

        // Working days = total calendar weekdays in month (Mon-Sat)
        let workingDays = 0;
        const cursor = new Date(startDate);
        while (cursor <= endDate) {
            const day = cursor.getDay();
            if (day !== 0) workingDays++; // Exclude Sunday
            cursor.setDate(cursor.getDate() + 1);
        }

        const presentDays = attendanceRecords.length;
        const absentDays = Math.max(0, workingDays - presentDays);

        // Calculate earned salary
        let earnedSalary = 0;
        if (employee.salaryType === "MONTHLY") {
            earnedSalary = workingDays > 0 ? (employee.baseSalary / workingDays) * presentDays : 0;
        } else {
            // DAILY
            earnedSalary = employee.baseSalary * presentDays;
        }
        earnedSalary = parseFloat(earnedSalary.toFixed(2));

        // Get unrecovered advances for this period
        const advances = await prisma.salaryAdvance.findMany({
            where: {
                employeeId,
                isRecovered: false,
                recoveredIn: `${year}-${month.toString().padStart(2, "0")}`,
            },
        });
        const advanceAmount = advances.reduce((s, a) => s + (a.type === "ADVANCE" || a.type === "DEDUCTION" ? a.amount : 0), 0);
        const bonusAmount = advances.reduce((s, a) => s + (a.type === "BONUS" ? a.amount : 0), 0);

        const netSalary = parseFloat((earnedSalary - advanceAmount + bonusAmount).toFixed(2));

        // Upsert salary record
        const record = await prisma.salaryRecord.upsert({
            where: { employeeId_month_year: { employeeId, month, year } },
            create: {
                employeeId,
                month,
                year,
                workingDays,
                presentDays,
                absentDays,
                baseSalary: employee.baseSalary,
                salaryType: employee.salaryType,
                earnedSalary,
                advanceAmount,
                bonusAmount,
                deductions: 0,
                netSalary,
                status: "DRAFT",
            },
            update: {
                workingDays,
                presentDays,
                absentDays,
                baseSalary: employee.baseSalary,
                salaryType: employee.salaryType,
                earnedSalary,
                advanceAmount,
                bonusAmount,
                netSalary,
            },
        });

        revalidatePath("/dashboard/salary");
        return { message: "Payroll calculated successfully", record };
    } catch (error) {
        console.error("Error processing salary:", error);
        return { message: "Failed to process salary" };
    }
}

// ─── PROCESS ALL EMPLOYEES FOR A MONTH ─────────────────────────────────────────
export async function processAllSalaries(month: number, year: number) {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        return { message: "Unauthorized" };
    }
    try {
        const employees = await prisma.employee.findMany({ where: { baseSalary: { gt: 0 } } });
        let processed = 0;
        for (const emp of employees) {
            await processMonthlySalary(emp.id, month, year);
            processed++;
        }
        revalidatePath("/dashboard/salary");
        return { message: `Processed ${processed} employees` };
    } catch (error) {
        console.error("Error processing all salaries:", error);
        return { message: "Failed to process all salaries" };
    }
}

// ─── MARK SALARY AS PAID ────────────────────────────────────────────────────────
export async function markSalaryPaid(salaryRecordId: string) {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        return { message: "Unauthorized" };
    }
    try {
        await prisma.salaryRecord.update({
            where: { id: salaryRecordId },
            data: { status: "PAID", paidAt: new Date(), paidBy: session.user.id },
        });
        revalidatePath("/dashboard/salary");
        return { message: "Salary marked as paid" };
    } catch (error) {
        return { message: "Failed to mark as paid" };
    }
}

// ─── GET SALARY RECORDS ─────────────────────────────────────────────────────────
export async function getSalaryRecords(month?: number, year?: number) {
    const session = await auth();
    if (!session) return [];

    try {
        const where: any = {};
        if (month) where.month = month;
        if (year) where.year = year;

        return await prisma.salaryRecord.findMany({
            where,
            include: {
                employee: {
                    include: { branch: { select: { name: true } } },
                },
            },
            orderBy: [{ year: "desc" }, { month: "desc" }],
        });
    } catch (error) {
        console.error("Error fetching salary records:", error);
        return [];
    }
}

// ─── GET EMPLOYEE SALARY HISTORY ───────────────────────────────────────────────
export async function getEmployeeSalaryHistory(employeeId: string) {
    const session = await auth();
    if (!session) return [];
    try {
        return await prisma.salaryRecord.findMany({
            where: { employeeId },
            orderBy: [{ year: "desc" }, { month: "desc" }],
        });
    } catch {
        return [];
    }
}

// ─── SALARY ADVANCES ────────────────────────────────────────────────────────────
export async function createSalaryAdvance(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || !["ADMIN", "BRANCH_MANAGER"].includes(session.user.role)) {
        return { message: "Unauthorized" };
    }
    try {
        const employeeId = formData.get("employeeId") as string;
        const type = formData.get("type") as AdvanceType;
        const amount = parseFloat(formData.get("amount") as string);
        const reason = formData.get("reason") as string;
        const recoveredIn = formData.get("recoveredIn") as string;

        if (!employeeId || !type || isNaN(amount) || amount <= 0 || !reason) {
            return { message: "All fields are required" };
        }

        await prisma.salaryAdvance.create({
            data: {
                employeeId,
                type,
                amount,
                reason,
                recoveredIn: recoveredIn || null,
                approvedBy: session.user.id,
            },
        });

        revalidatePath("/dashboard/salary");
        return { message: "Advance / Bonus recorded successfully" };
    } catch (error) {
        console.error("Error creating advance:", error);
        return { message: "Failed to record advance" };
    }
}

export async function getEmployeeAdvances(employeeId: string) {
    const session = await auth();
    if (!session) return [];
    try {
        return await prisma.salaryAdvance.findMany({
            where: { employeeId },
            orderBy: { date: "desc" },
        });
    } catch {
        return [];
    }
}

export async function getAllAdvances() {
    const session = await auth();
    if (!session) return [];
    try {
        return await prisma.salaryAdvance.findMany({
            include: {
                employee: { select: { id: true, name: true, designation: true } },
            },
            orderBy: { date: "desc" },
        });
    } catch {
        return [];
    }
}

// ─── PAYROLL DASHBOARD STATS ────────────────────────────────────────────────────
export async function getPayrollStats(month: number, year: number) {
    const session = await auth();
    if (!session) return null;
    try {
        const records = await prisma.salaryRecord.findMany({
            where: { month, year },
            include: { employee: { select: { name: true, designation: true } } },
        });

        const totalPayable = records.reduce((s, r) => s + r.netSalary, 0);
        const totalPaid = records.filter(r => r.status === "PAID").reduce((s, r) => s + r.netSalary, 0);
        const pending = records.filter(r => r.status !== "PAID").length;

        return { records, totalPayable, totalPaid, pending, totalEmployees: records.length };
    } catch {
        return null;
    }
}

export { MONTHS };

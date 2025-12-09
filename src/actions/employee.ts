"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

const employeeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    designation: z.string().min(1, "Designation is required"),
    phone: z.string().optional(),
    branchId: z.string().min(1, "Branch is required"),
});

// Type for Employee with Branch relation
export type EmployeeWithBranch = Prisma.EmployeeGetPayload<{
    include: { branch: true };
}>;

export async function getEmployees(): Promise<EmployeeWithBranch[]> {
    const session = await auth();
    if (!session) return [];

    return await prisma.employee.findMany({
        include: { branch: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function createEmployee(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const validatedFields = employeeSchema.safeParse({
        name: formData.get("name"),
        designation: formData.get("designation"),
        phone: formData.get("phone"),
        branchId: formData.get("branchId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Employee.",
        };
    }

    const { name, designation, phone, branchId } = validatedFields.data;

    try {
        await prisma.employee.create({
            data: {
                name,
                designation,
                phone,
                branchId,
            },
        });
    } catch (error) {
        return { message: "Database Error: Failed to Create Employee." };
    }

    revalidatePath("/dashboard/employees");
    return { message: "Success" };
}

export async function getEmployeeById(id: string) {
    const session = await auth();
    if (!session) return null;

    try {
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: { branch: true },
        });
        return employee;
    } catch (error) {
        return null;
    }
}

export async function updateEmployee(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const validatedFields = employeeSchema.safeParse({
        name: formData.get("name"),
        designation: formData.get("designation"),
        phone: formData.get("phone"),
        branchId: formData.get("branchId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Employee.",
        };
    }

    const { name, designation, phone, branchId } = validatedFields.data;

    try {
        await prisma.employee.update({
            where: { id },
            data: {
                name,
                designation,
                phone,
                branchId,
            },
        });
    } catch (error) {
        return { message: "Database Error: Failed to Update Employee." };
    }

    revalidatePath("/dashboard/employees");
    return { message: "Success" };
}

export async function deleteEmployee(id: string) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    try {
        // Check if employee has related records
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        attendance: true,
                        productionLogs: true,
                        breaks: true,
                        leaveRequests: true,
                    },
                },
            },
        });

        if (!employee) {
            return { message: "Employee not found" };
        }

        // Delete the employee (cascading deletes will handle related records)
        await prisma.employee.delete({
            where: { id },
        });

        revalidatePath("/dashboard/employees");
        return { message: "Employee deleted successfully" };
    } catch (error) {
        console.error("Error deleting employee:", error);
        return { message: "Failed to delete employee. They may have related records." };
    }
}

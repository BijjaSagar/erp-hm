"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CreateContraEntryInput {
    transactionType: "DEPOSIT" | "WITHDRAWAL";
    fromAccount: string;
    toAccount: string;
    amount: number;
    chequeNumber: string;
    chequeDate?: Date;
    bankName: string;
    description?: string;
    storeId: string;
}

export async function createContraEntry(input: CreateContraEntryInput) {
    try {
        const session = await auth();

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "STORE_MANAGER") {
            return { success: false, error: "Insufficient permissions" };
        }

        // Validate input
        if (!input.fromAccount || !input.toAccount || !input.amount || !input.chequeNumber || !input.bankName) {
            return { success: false, error: "Missing required fields" };
        }

        if (input.amount <= 0) {
            return { success: false, error: "Amount must be greater than 0" };
        }

        // Create the contra entry description
        const description = `Contra Entry - ${input.transactionType} - Cheque #${input.chequeNumber} - ${input.bankName}${input.description ? ` - ${input.description}` : ""
            }`;

        // Create accounting entry
        const entry = await db.accountingEntry.create({
            data: {
                entryType: "TRANSFER",
                description,
                debitAccount: input.toAccount,
                creditAccount: input.fromAccount,
                amount: input.amount,
                date: input.chequeDate || new Date(),
            },
        });

        // Revalidate the page
        revalidatePath("/dashboard/pos/contra-entry");

        return { success: true, data: entry };
    } catch (error) {
        console.error("Error creating contra entry:", error);
        return { success: false, error: "Failed to create contra entry" };
    }
}

export async function getContraEntries(limit = 50) {
    try {
        const session = await auth();

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const entries = await db.accountingEntry.findMany({
            where: {
                entryType: "TRANSFER",
                description: {
                    contains: "Contra Entry",
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        });

        return { success: true, data: entries };
    } catch (error) {
        console.error("Error fetching contra entries:", error);
        return { success: false, error: "Failed to fetch contra entries" };
    }
}

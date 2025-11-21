'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPendingApprovals() {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const pendingEntries = await prisma.productionEntry.findMany({
            where: {
                endTime: { not: null }, // Only completed sessions
                qualityApproved: false
            },
            include: {
                order: true,
                machine: true,
                operator: true,
                materialConsumptions: {
                    include: {
                        material: true
                    }
                }
            },
            orderBy: {
                endTime: 'desc'
            }
        });

        return { pendingEntries };
    } catch (error) {
        console.error("Failed to fetch pending approvals:", error);
        return { error: "Failed to fetch pending approvals" };
    }
}

export async function approveProductionEntry(entryId: string, notes?: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.productionEntry.update({
            where: { id: entryId },
            data: {
                qualityApproved: true,
                approvedBy: session.user.employeeId,
                approvedAt: new Date(),
                qualityNotes: notes
            }
        });

        revalidatePath('/dashboard/production/approvals');
        return { success: true };
    } catch (error) {
        console.error("Failed to approve entry:", error);
        return { error: "Failed to approve entry" };
    }
}

export async function rejectProductionEntry(entryId: string, notes: string) {
    // Rejection might involve more complex logic like reverting stock or flagging for rework
    // For now, we'll just add notes and maybe a status flag if we had one
    // But the schema only has qualityApproved boolean. 
    // We might need a status enum or just keep it unapproved with notes.

    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.productionEntry.update({
            where: { id: entryId },
            data: {
                qualityApproved: false, // Explicitly false
                qualityNotes: `REJECTED: ${notes}`,
                // We don't set approvedBy/At so it stays in pending list or we need a separate rejected list
            }
        });

        revalidatePath('/dashboard/production/approvals');
        return { success: true };
    } catch (error) {
        console.error("Failed to reject entry:", error);
        return { error: "Failed to reject entry" };
    }
}

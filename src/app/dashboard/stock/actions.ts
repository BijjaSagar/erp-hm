'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { StockTxType, InventoryItem } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getInventory(): Promise<{ items: InventoryItem[] }> {
    const items = await prisma.inventoryItem.findMany({
        orderBy: { name: 'asc' }
    });
    return { items };
}

export async function updateStock(itemId: string, quantity: number, type: StockTxType) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemId }
        });

        if (!item) {
            return { error: "Item not found" };
        }

        let newQuantity = item.quantity;
        if (type === 'IN') {
            newQuantity += quantity;
        } else if (type === 'OUT') {
            newQuantity -= quantity;
        } else {
            // ADJUSTMENT sets the absolute value (simplified logic, or could be diff)
            // For now let's assume adjustment is a correction, so we might need a different logic.
            // But to keep it simple for this 'updateStock' function which takes a quantity delta:
            // Let's treat ADJUSTMENT as setting the quantity directly? 
            // Or maybe just stick to IN/OUT for operators.
            // Let's stick to IN/OUT for now.
            return { error: "Invalid transaction type" };
        }

        if (newQuantity < 0) {
            return { error: "Insufficient stock" };
        }

        await prisma.$transaction([
            prisma.inventoryItem.update({
                where: { id: itemId },
                data: { quantity: newQuantity }
            }),
            prisma.stockTransaction.create({
                data: {
                    itemId,
                    quantity,
                    type,
                    userId: session.user.id,
                }
            })
        ]);

        revalidatePath('/dashboard/stock');
        return { success: true };
    } catch (error) {
        console.error("Failed to update stock:", error);
        return { error: "Failed to update stock" };
    }
}

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { transferFromProduction } from "./stock-transfer";
import { redirect } from "next/navigation";

export async function createTransferFromForm(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const orderId = formData.get("orderId") as string;
    const storeId = formData.get("storeId") as string;

    if (!orderId || !storeId) {
        throw new Error("Missing required fields");
    }

    // Get order details to create items
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });

    if (!order) {
        throw new Error("Order not found");
    }

    // Create items from order
    const items = order.items.map(item => ({
        productName: item.productName,
        sku: `SKU-${item.id}`,
        quantity: item.quantity,
        unit: "pcs"
    }));

    await transferFromProduction(orderId, storeId, items);

    // Always redirect on success
    redirect("/dashboard/stock-transfers");
}

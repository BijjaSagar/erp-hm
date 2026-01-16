import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createMarketingHead() {
    try {
        // Check if marketing head already exists
        const existing = await prisma.user.findFirst({
            where: { role: "MARKETING_HEAD" },
        });

        if (existing) {
            console.log("✅ Marketing Head user already exists:");
            console.log("   Email:", existing.email);
            console.log("   Name:", existing.name);
            return;
        }

        // Create Marketing Head user
        const hashedPassword = await bcrypt.hash("marketing123", 10);

        const marketingHead = await prisma.user.create({
            data: {
                email: "marketing@hm-erp.com",
                password: hashedPassword,
                name: "Marketing Head",
                role: "MARKETING_HEAD",
            },
        });

        console.log("✅ Marketing Head user created successfully!");
        console.log("   Email: marketing@hm-erp.com");
        console.log("   Password: marketing123");
        console.log("   Role: MARKETING_HEAD");
        console.log("\n🔐 Login credentials:");
        console.log("   Email: marketing@hm-erp.com");
        console.log("   Password: marketing123");
    } catch (error) {
        console.error("❌ Error creating Marketing Head:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createMarketingHead();

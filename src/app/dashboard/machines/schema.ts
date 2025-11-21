import { z } from "zod";
import { ProductionStage } from "@prisma/client";

export const machineSchema = z.object({
    name: z.string().min(1, "Machine name is required"),
    code: z.string().min(1, "Machine code is required"),
    stage: z.nativeEnum(ProductionStage),
    capacity: z.coerce.number().optional(),
    branchId: z.string().min(1, "Branch is required"),
    isActive: z.boolean().optional(),
});

export type MachineData = z.infer<typeof machineSchema>;

import { ProductionStage } from "@prisma/client";

export const PRODUCTION_STAGES_ORDER = [
    ProductionStage.PENDING,
    ProductionStage.CUTTING,
    ProductionStage.SHAPING,
    ProductionStage.BENDING,
    ProductionStage.WELDING_INNER,
    ProductionStage.WELDING_OUTER,
    ProductionStage.GRINDING,
    ProductionStage.FINISHING,
    ProductionStage.PAINTING,
    ProductionStage.PLYWOOD_FITTING,
    ProductionStage.PREPARATION,
    ProductionStage.COMPLETED,
];

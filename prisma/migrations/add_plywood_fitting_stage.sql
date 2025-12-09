-- Add PLYWOOD_FITTING to ProductionStage enum
-- This migration adds a new production stage after PAINTING

-- AlterEnum
ALTER TYPE "ProductionStage" ADD VALUE 'PLYWOOD_FITTING';

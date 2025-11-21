/*
  Warnings:

  - The values [INWARD,POWER_PRESS,SPOT_WELDING,WELDING,FINAL_COLOR] on the enum `ProductionStage` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StockTxType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- AlterEnum
BEGIN;
CREATE TYPE "ProductionStage_new" AS ENUM ('PENDING', 'CUTTING', 'SHAPING', 'BENDING', 'WELDING_INNER', 'WELDING_OUTER', 'GRINDING', 'FINISHING', 'PAINTING', 'COMPLETED');
ALTER TABLE "Order" ALTER COLUMN "currentStage" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "currentStage" TYPE "ProductionStage_new" USING ("currentStage"::text::"ProductionStage_new");
ALTER TABLE "ProductionLog" ALTER COLUMN "stage" TYPE "ProductionStage_new" USING ("stage"::text::"ProductionStage_new");
ALTER TYPE "ProductionStage" RENAME TO "ProductionStage_old";
ALTER TYPE "ProductionStage_new" RENAME TO "ProductionStage";
DROP TYPE "ProductionStage_old";
ALTER TABLE "Order" ALTER COLUMN "currentStage" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "currentStage" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeId" TEXT;

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "minThreshold" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransaction" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "type" "StockTxType" NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_name_key" ON "InventoryItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Shop` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_vendorId_fkey";

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "vendorId";

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

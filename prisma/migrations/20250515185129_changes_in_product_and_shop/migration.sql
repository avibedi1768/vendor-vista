/*
  Warnings:

  - You are about to drop the `ProductOnShop` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shopId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductOnShop" DROP CONSTRAINT "ProductOnShop_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOnShop" DROP CONSTRAINT "ProductOnShop_shopId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shopId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProductOnShop";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

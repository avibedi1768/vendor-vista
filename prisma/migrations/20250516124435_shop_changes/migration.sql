/*
  Warnings:

  - You are about to drop the column `metaData` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `shopUrl` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "metaData",
DROP COLUMN "shopUrl",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

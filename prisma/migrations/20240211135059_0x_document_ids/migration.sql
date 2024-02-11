/*
  Warnings:

  - You are about to drop the column `userId` on the `document` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_userId_fkey";

-- AlterTable
ALTER TABLE "document" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

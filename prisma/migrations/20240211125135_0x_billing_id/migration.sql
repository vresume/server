/*
  Warnings:

  - You are about to drop the column `auth0_user_id` on the `billing` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `billing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "billing" DROP CONSTRAINT "billing_auth0_user_id_fkey";

-- AlterTable
ALTER TABLE "billing" DROP COLUMN "auth0_user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

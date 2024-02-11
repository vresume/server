/*
  Warnings:

  - Added the required column `documentId` to the `version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "version" ADD COLUMN     "documentId" INTEGER NOT NULL;

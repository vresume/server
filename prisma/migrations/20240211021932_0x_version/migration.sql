/*
  Warnings:

  - You are about to drop the column `documentId` on the `version` table. All the data in the column will be lost.
  - Added the required column `versionId` to the `resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "version" DROP CONSTRAINT "version_documentId_fkey";

-- AlterTable
ALTER TABLE "resume" ADD COLUMN     "versionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "version" DROP COLUMN "documentId";

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

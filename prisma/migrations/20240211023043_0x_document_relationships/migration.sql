/*
  Warnings:

  - You are about to drop the column `postingId` on the `resume` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `resume` table. All the data in the column will be lost.
  - You are about to drop the column `versionId` on the `resume` table. All the data in the column will be lost.
  - Added the required column `version_id` to the `resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "resume" DROP CONSTRAINT "resume_postingId_fkey";

-- DropForeignKey
ALTER TABLE "resume" DROP CONSTRAINT "resume_profileId_fkey";

-- DropForeignKey
ALTER TABLE "resume" DROP CONSTRAINT "resume_versionId_fkey";

-- AlterTable
ALTER TABLE "resume" DROP COLUMN "postingId",
DROP COLUMN "profileId",
DROP COLUMN "versionId",
ADD COLUMN     "posting_id" INTEGER,
ADD COLUMN     "profile_id" INTEGER,
ADD COLUMN     "version_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "posting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

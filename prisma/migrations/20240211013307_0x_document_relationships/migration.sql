-- DropForeignKey
ALTER TABLE "posting" DROP CONSTRAINT "posting_documentId_fkey";

-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_documentId_fkey";

-- AlterTable
ALTER TABLE "resume" ADD COLUMN     "postingId" INTEGER,
ADD COLUMN     "profileId" INTEGER;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "posting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

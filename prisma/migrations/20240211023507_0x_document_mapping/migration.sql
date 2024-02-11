/*
  Warnings:

  - You are about to drop the `resume` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "resume" DROP CONSTRAINT "resume_posting_id_fkey";

-- DropForeignKey
ALTER TABLE "resume" DROP CONSTRAINT "resume_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "resume" DROP CONSTRAINT "resume_userId_fkey";

-- DropForeignKey
ALTER TABLE "resume" DROP CONSTRAINT "resume_version_id_fkey";

-- DropTable
DROP TABLE "resume";

-- CreateTable
CREATE TABLE "document" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'resume',
    "description" TEXT,
    "userId" INTEGER,
    "version_id" INTEGER NOT NULL DEFAULT 1,
    "profile_id" INTEGER,
    "posting_id" INTEGER,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "posting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

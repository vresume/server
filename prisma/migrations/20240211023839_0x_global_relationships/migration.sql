-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_posting_id_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_version_id_fkey";

-- AlterTable
ALTER TABLE "document" ALTER COLUMN "version_id" DROP DEFAULT;

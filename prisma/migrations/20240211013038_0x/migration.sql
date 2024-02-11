-- CreateEnum
CREATE TYPE "Role" AS ENUM ('individual', 'recruiter', 'administrator');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('resume', 'coverLetter', 'other');

-- CreateTable
CREATE TABLE "auth0_user" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "nickname" TEXT,
    "given_name" TEXT,
    "family_name" TEXT,
    "locale" TEXT,

    CONSTRAINT "auth0_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "stripe_current_period_end" TIMESTAMPTZ(6),
    "stripe_cancel_at" TIMESTAMPTZ(6),
    "auth0_user_id" TEXT NOT NULL,

    CONSTRAINT "billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auth_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'individual',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'resume',
    "description" TEXT,
    "userId" INTEGER,

    CONSTRAINT "resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt" TEXT,
    "data" TEXT,
    "documentId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokens" TEXT,
    "blob" TEXT,
    "text" TEXT,
    "documentId" INTEGER NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posting" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokens" TEXT,
    "blob" TEXT,
    "text" TEXT,
    "documentId" INTEGER NOT NULL,

    CONSTRAINT "posting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth0_user_id_key" ON "auth0_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "auth0_user_email_key" ON "auth0_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "billing_stripe_customer_id_key" ON "billing"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_stripe_subscription_id_key" ON "billing"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_id_key" ON "user"("auth_id");

-- AddForeignKey
ALTER TABLE "auth0_user" ADD CONSTRAINT "auth0_user_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing" ADD CONSTRAINT "billing_auth0_user_id_fkey" FOREIGN KEY ("auth0_user_id") REFERENCES "auth0_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version" ADD CONSTRAINT "version_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posting" ADD CONSTRAINT "posting_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

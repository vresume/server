/*
  Warnings:

  - You are about to drop the `billing` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "stripe_cancel_at" TIMESTAMPTZ(6),
ADD COLUMN     "stripe_current_period_end" TIMESTAMPTZ(6),
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- DropTable
DROP TABLE "billing";

-- CreateIndex
CREATE UNIQUE INDEX "user_stripe_customer_id_key" ON "user"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_stripe_subscription_id_key" ON "user"("stripe_subscription_id");

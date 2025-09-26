/*
  Warnings:

  - You are about to drop the `donation_proofs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "donation_proofs" DROP CONSTRAINT "donation_proofs_donation_id_fkey";

-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_program_period_id_fkey";

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "donation_proof_image" TEXT,
ALTER COLUMN "program_period_id" DROP NOT NULL;

-- DropTable
DROP TABLE "donation_proofs";

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_program_period_id_fkey" FOREIGN KEY ("program_period_id") REFERENCES "program_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

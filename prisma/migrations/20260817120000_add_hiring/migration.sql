-- CreateEnum
CREATE TYPE "HiringProgress" AS ENUM ('WAITING', 'INTERVIEWED', 'PASSED', 'REJECTED');

-- AlterTable
ALTER TABLE "Payroll" ALTER COLUMN "deduction" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Hiring" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "coverLetter" TEXT,
    "graduateYear" TEXT NOT NULL,
    "dateApplied" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experience" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "HiringProgress" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "Hiring_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hiring_email_key" ON "Hiring"("email");

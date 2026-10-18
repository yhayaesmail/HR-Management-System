-- Enable UUID if not already
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Company table
CREATE TABLE "Company" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'FREE',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add nullable companyId columns
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Employee" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Tasks" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Payroll" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Hiring" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "companyId" TEXT;
ALTER TABLE "ConversationParticipant" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Message" ADD COLUMN "companyId" TEXT;
ALTER TABLE "RefreshToken" ADD COLUMN "companyId" TEXT;

-- Insert default company for existing data
INSERT INTO "Company" (id, name, slug, plan, "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Default Company', 'default', 'FREE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Backfill all existing rows into default company
UPDATE "User" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "Employee" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "Attendance" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "Tasks" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "Payroll" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "Hiring" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "Conversation" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "ConversationParticipant" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "Message" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;
UPDATE "RefreshToken" SET "companyId" = (SELECT id FROM "Company" WHERE slug = 'default' LIMIT 1) WHERE "companyId" IS NULL;

-- Make companyId NOT NULL
ALTER TABLE "User" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Attendance" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Tasks" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Payroll" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Hiring" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Conversation" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "ConversationParticipant" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Message" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "RefreshToken" ALTER COLUMN "companyId" SET NOT NULL;

-- Replace global uniques with per-company uniques
ALTER TABLE "Employee" DROP CONSTRAINT IF EXISTS "Employee_userId_key";
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_userId_key" UNIQUE ("companyId", "userId");

ALTER TABLE "Hiring" DROP CONSTRAINT IF EXISTS "Hiring_email_key";
ALTER TABLE "Hiring" ADD CONSTRAINT "Hiring_companyId_email_key" UNIQUE ("companyId", "email");

-- Add indexes for tenant lookups
CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");
CREATE INDEX IF NOT EXISTS "Employee_companyId_idx" ON "Employee"("companyId");
CREATE INDEX IF NOT EXISTS "Attendance_companyId_idx" ON "Attendance"("companyId");
CREATE INDEX IF NOT EXISTS "Tasks_companyId_idx" ON "Tasks"("companyId");
CREATE INDEX IF NOT EXISTS "Payroll_companyId_idx" ON "Payroll"("companyId");
CREATE INDEX IF NOT EXISTS "Hiring_companyId_idx" ON "Hiring"("companyId");
CREATE INDEX IF NOT EXISTS "Conversation_companyId_idx" ON "Conversation"("companyId");
CREATE INDEX IF NOT EXISTS "Message_companyId_idx" ON "Message"("companyId");
CREATE INDEX IF NOT EXISTS "RefreshToken_companyId_idx" ON "RefreshToken"("companyId");

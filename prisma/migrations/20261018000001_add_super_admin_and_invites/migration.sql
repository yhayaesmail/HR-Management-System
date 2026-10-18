-- Add new enum values
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'COMPANY_ADMIN';

-- Migrate existing ADMIN users to COMPANY_ADMIN
UPDATE "User" SET role = 'COMPANY_ADMIN' WHERE role = 'ADMIN';

-- Create Invite table
CREATE TABLE "Invite" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  "companyId" TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Invite_companyId_idx" ON "Invite"("companyId");
CREATE INDEX IF NOT EXISTS "Invite_token_idx" ON "Invite"("token");

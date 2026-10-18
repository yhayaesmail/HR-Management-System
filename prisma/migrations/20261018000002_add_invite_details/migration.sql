-- Add optional employee details to Invite so invited employees
-- get an Employee record created automatically on registration.

ALTER TABLE "Invite" ADD COLUMN "name" TEXT;
ALTER TABLE "Invite" ADD COLUMN "department" TEXT;
ALTER TABLE "Invite" ADD COLUMN "title" TEXT;
ALTER TABLE "Invite" ADD COLUMN "salary" DOUBLE PRECISION;

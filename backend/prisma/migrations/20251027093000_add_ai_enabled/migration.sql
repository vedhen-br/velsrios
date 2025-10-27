-- Add aiEnabled flag to leads table
ALTER TABLE "leads" ADD COLUMN "aiEnabled" BOOLEAN NOT NULL DEFAULT true;

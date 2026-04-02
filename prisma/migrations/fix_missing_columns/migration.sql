-- Add missing columns to fix Prisma errors

-- Add ip column to AuditLog table
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "ip" TEXT;

-- Add modoDemo column to Config table
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "modoDemo" BOOLEAN DEFAULT true;

-- Migration: Add name, cpf, whatsapp columns to Payment table
-- Created: 2026-04-02

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- Create index on cpf for faster lookups
CREATE INDEX IF NOT EXISTS "Payment_cpf_idx" ON "Payment"("cpf");

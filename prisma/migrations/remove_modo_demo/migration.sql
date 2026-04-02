-- Remove modoDemo column from Config table
-- O sistema agora opera apenas em modo real
ALTER TABLE "Config" DROP COLUMN IF EXISTS "modoDemo";

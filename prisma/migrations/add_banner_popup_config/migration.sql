-- Migration: Adicionar campos de banner e popup ao modelo Config
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "mainBannerUrl" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "mainBannerLink" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "mainBannerActive" BOOLEAN DEFAULT true;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "popupImageUrl" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "popupLink" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "popupActive" BOOLEAN DEFAULT false;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "popupDelay" INTEGER DEFAULT 3;

-- Migration: Adicionar campos para múltiplos banners (até 5 imagens)
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "mainBannerUrl2" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "mainBannerUrl3" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "mainBannerUrl4" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "mainBannerUrl5" TEXT;

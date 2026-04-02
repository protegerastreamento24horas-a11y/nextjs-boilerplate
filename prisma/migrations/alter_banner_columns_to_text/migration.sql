-- Migration: Alterar colunas de banner para TEXT (suporta imagens base64 grandes)
ALTER TABLE "Raffle" ALTER COLUMN "homeBanner" TYPE TEXT;
ALTER TABLE "Raffle" ALTER COLUMN "pageBanner" TYPE TEXT;
ALTER TABLE "Raffle" ALTER COLUMN "logoUrl" TYPE TEXT;

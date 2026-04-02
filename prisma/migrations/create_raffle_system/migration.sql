-- Create Raffle table for multi-raffle system
CREATE TABLE "Raffle" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fullDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "homeBanner" TEXT,
    "pageBanner" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#FFD700',
    "secondaryColor" TEXT NOT NULL DEFAULT '#FFA500',
    "packages" TEXT NOT NULL DEFAULT '[{"id":1,"quantity":1,"price":5,"label":"1 Tentativa","popular":false},{"id":2,"quantity":3,"price":12,"label":"3 Tentativas","popular":true,"save":3},{"id":3,"quantity":5,"price":20,"label":"5 Tentativas","popular":false,"save":5}]',
    "totalParticipants" INTEGER NOT NULL DEFAULT 0,
    "totalWinners" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add raffleId to Payment table
ALTER TABLE "Payment" ADD COLUMN "raffleId" TEXT;

-- Create foreign key relationship
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_raffleId_fkey" 
    FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "Raffle_isActive_idx" ON "Raffle"("isActive");
CREATE INDEX "Raffle_order_idx" ON "Raffle"("order");
CREATE INDEX "Payment_raffleId_idx" ON "Payment"("raffleId");

-- Insert default raffles (Stella Artois, Heineken, Corona)
INSERT INTO "Raffle" ("id", "slug", "name", "description", "fullDescription", "isActive", "order", "primaryColor", "secondaryColor", "updatedAt") VALUES
    (gen_random_uuid(), 'stella', 'Sorteio Stella Artois', 'Ganhe uma caixa de Stella Artois!', 'Participe do sorteio exclusivo Stella Artois. Raspe e concorra a uma caixa completa da cerveja belga mais famosa do mundo.', true, 1, '#1E3A8A', '#FCD34D', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'heineken', 'Sorteio Heineken', 'Ganhe uma caixa de Heineken!', 'Participe do sorteio exclusivo Heineken. Raspe e concorra a uma caixa completa da cerveja holandesa premium.', true, 2, '#16A34A', '#FCD34D', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'corona', 'Sorteio Corona', 'Ganhe uma caixa de Corona!', 'Participe do sorteio exclusivo Corona. Raspe e concorra a uma caixa completa da cerveja mexicana mais refrescante.', true, 3, '#FCD34D', '#1E3A8A', CURRENT_TIMESTAMP);

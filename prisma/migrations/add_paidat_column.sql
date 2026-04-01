-- Migration: Adicionar coluna paidAt na tabela AffiliateWithdrawal
-- Executar no console do Neon: https://console.neon.tech/

-- Adicionar coluna paidAt (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'AffiliateWithdrawal' 
        AND column_name = 'paidAt'
    ) THEN
        ALTER TABLE "AffiliateWithdrawal" ADD COLUMN "paidAt" TIMESTAMP(3);
        RAISE NOTICE 'Coluna paidAt adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna paidAt já existe';
    END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'AffiliateWithdrawal' 
AND column_name = 'paidAt';

-- Migration: Adicionar coluna notes na tabela AffiliateWithdrawal
-- Executar no console do Neon: https://console.neon.tech/

-- Adicionar coluna notes (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'AffiliateWithdrawal' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE "AffiliateWithdrawal" ADD COLUMN "notes" TEXT;
        RAISE NOTICE 'Coluna notes adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna notes já existe';
    END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'AffiliateWithdrawal' 
AND column_name = 'notes';

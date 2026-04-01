-- Migration: Adicionar colunas affiliateId e affiliateCode na tabela Payment
-- Executar no console do Neon: https://console.neon.tech/

-- Adicionar coluna affiliateId (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'affiliateId'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "affiliateId" TEXT;
        RAISE NOTICE 'Coluna affiliateId adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna affiliateId já existe';
    END IF;
END $$;

-- Adicionar coluna affiliateCode (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'affiliateCode'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "affiliateCode" TEXT;
        RAISE NOTICE 'Coluna affiliateCode adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna affiliateCode já existe';
    END IF;
END $$;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Payment' 
AND column_name IN ('affiliateId', 'affiliateCode');

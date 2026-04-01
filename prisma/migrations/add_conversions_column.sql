-- Migration: Adicionar coluna conversions na tabela Affiliate
-- Executar no console do Neon: https://console.neon.tech/

-- Adicionar coluna conversions (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Affiliate' 
        AND column_name = 'conversions'
    ) THEN
        ALTER TABLE "Affiliate" ADD COLUMN "conversions" INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Coluna conversions adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna conversions já existe';
    END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Affiliate' 
AND column_name = 'conversions';

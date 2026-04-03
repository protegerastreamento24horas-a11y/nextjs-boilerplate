-- Adicionar coluna email à tabela Payment
-- Para API CashinPay

-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "email" TEXT;
        COMMENT ON COLUMN "Payment"."email" IS 'Email do cliente para CashinPay';
    END IF;
END $$;

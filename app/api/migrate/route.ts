import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API temporária para aplicar migração manual das tabelas de afiliado
export async function GET(request: NextRequest) {
  try {
    // Criar tabela Affiliate
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Affiliate" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "phone" TEXT,
        "cpf" TEXT,
        "pixKey" TEXT,
        "pixKeyType" TEXT NOT NULL DEFAULT 'cpf',
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalSales" INTEGER NOT NULL DEFAULT 0,
        "clicks" INTEGER NOT NULL DEFAULT 0,
        "conversions" INTEGER NOT NULL DEFAULT 0,
        "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;

    // Criar tabela AffiliateClick
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AffiliateClick" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "affiliateId" TEXT NOT NULL,
        "ip" TEXT,
        "userAgent" TEXT,
        "referrer" TEXT,
        "converted" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AffiliateClick_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    // Criar tabela AffiliateCommission
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AffiliateCommission" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "affiliateId" TEXT NOT NULL,
        "paymentId" TEXT,
        "amount" DOUBLE PRECISION NOT NULL,
        "commission" DOUBLE PRECISION NOT NULL,
        "rate" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "AffiliateCommission_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "AffiliateCommission_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `;

    // Criar tabela AffiliateWithdrawal
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AffiliateWithdrawal" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "affiliateId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "pixKey" TEXT NOT NULL,
        "pixKeyType" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "processedAt" TIMESTAMP(3),
        "rejectionReason" TEXT,
        CONSTRAINT "AffiliateWithdrawal_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    // Criar índices
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Affiliate_status_idx" ON "Affiliate"("status");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "AffiliateClick_affiliateId_idx" ON "AffiliateClick"("affiliateId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "AffiliateCommission_affiliateId_idx" ON "AffiliateCommission"("affiliateId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "AffiliateCommission_status_idx" ON "AffiliateCommission"("status");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "AffiliateWithdrawal_affiliateId_idx" ON "AffiliateWithdrawal"("affiliateId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "AffiliateWithdrawal_status_idx" ON "AffiliateWithdrawal"("status");`;

    // Verificar/criar colunas na tabela Payment
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Payment' AND column_name = 'affiliateId'
    `;

    if (!Array.isArray(result) || result.length === 0) {
      await prisma.$executeRaw`ALTER TABLE "Payment" ADD COLUMN "affiliateId" TEXT;`;
      await prisma.$executeRaw`ALTER TABLE "Payment" ADD COLUMN "affiliateCode" TEXT;`;
      await prisma.$executeRaw`CREATE INDEX "Payment_affiliateId_idx" ON "Payment"("affiliateId");`;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tabelas de afiliado criadas com sucesso!' 
    });
  } catch (error: any) {
    console.error('Erro na migração:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API temporária para aplicar migração manual
export async function GET(request: NextRequest) {
  try {
    // Verificar se já tem as colunas
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Payment' AND column_name = 'affiliateId'
    `;

    if (Array.isArray(result) && result.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Migração já aplicada' 
      });
    }

    // Aplicar migração manual
    await prisma.$executeRaw`
      ALTER TABLE "Payment" ADD COLUMN "affiliateId" TEXT;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "Payment" ADD COLUMN "affiliateCode" TEXT;
    `;
    await prisma.$executeRaw`
      CREATE INDEX "Payment_affiliateId_idx" ON "Payment"("affiliateId");
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Migração aplicada com sucesso!' 
    });
  } catch (error: any) {
    console.error('Erro na migração:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API para adicionar colunas affiliateId e affiliateCode na tabela Payment
export async function GET(request: NextRequest) {
  try {
    // Verificar se colunas já existem
    const columnsExist = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Payment' 
      AND column_name IN ('affiliateId', 'affiliateCode')
    `;

    const existingColumns = Array.isArray(columnsExist) ? columnsExist.map((c: any) => c.column_name) : [];
    
    const results = [];

    // Adicionar coluna affiliateId se não existir
    if (!existingColumns.includes('affiliateId')) {
      await prisma.$executeRaw`
        ALTER TABLE "Payment" ADD COLUMN "affiliateId" TEXT
      `;
      results.push('Coluna affiliateId adicionada com sucesso');
    } else {
      results.push('Coluna affiliateId já existe');
    }

    // Adicionar coluna affiliateCode se não existir
    if (!existingColumns.includes('affiliateCode')) {
      await prisma.$executeRaw`
        ALTER TABLE "Payment" ADD COLUMN "affiliateCode" TEXT
      `;
      results.push('Coluna affiliateCode adicionada com sucesso');
    } else {
      results.push('Coluna affiliateCode já existe');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration executada',
      results
    });
  } catch (error: any) {
    console.error('Erro ao adicionar colunas:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API para adicionar coluna paidAt na tabela AffiliateWithdrawal
export async function GET(request: NextRequest) {
  try {
    // Verificar se coluna já existe
    const columnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'AffiliateWithdrawal' AND column_name = 'paidAt'
    `;

    if (Array.isArray(columnExists) && columnExists.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Coluna paidAt já existe',
        column: columnExists
      });
    }

    // Adicionar coluna paidAt
    await prisma.$executeRaw`
      ALTER TABLE "AffiliateWithdrawal" ADD COLUMN "paidAt" TIMESTAMP(3)
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Coluna paidAt adicionada com sucesso!' 
    });
  } catch (error: any) {
    console.error('Erro ao adicionar coluna:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

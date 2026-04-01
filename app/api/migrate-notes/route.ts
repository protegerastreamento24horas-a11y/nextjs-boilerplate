import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API para adicionar coluna notes na tabela AffiliateWithdrawal
export async function GET(request: NextRequest) {
  try {
    // Verificar se coluna já existe
    const columnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'AffiliateWithdrawal' AND column_name = 'notes'
    `;

    if (Array.isArray(columnExists) && columnExists.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Coluna notes já existe',
        column: columnExists
      });
    }

    // Adicionar coluna notes
    await prisma.$executeRaw`
      ALTER TABLE "AffiliateWithdrawal" ADD COLUMN "notes" TEXT
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Coluna notes adicionada com sucesso!' 
    });
  } catch (error: any) {
    console.error('Erro ao adicionar coluna:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

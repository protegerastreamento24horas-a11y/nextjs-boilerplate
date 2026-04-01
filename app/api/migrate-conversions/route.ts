import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API para adicionar coluna conversions na tabela Affiliate
export async function GET(request: NextRequest) {
  try {
    // Verificar se coluna já existe
    const columnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Affiliate' AND column_name = 'conversions'
    `;

    if (Array.isArray(columnExists) && columnExists.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Coluna conversions já existe',
        column: columnExists
      });
    }

    // Adicionar coluna conversions
    await prisma.$executeRaw`
      ALTER TABLE "Affiliate" ADD COLUMN "conversions" INTEGER NOT NULL DEFAULT 0
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Coluna conversions adicionada com sucesso!' 
    });
  } catch (error: any) {
    console.error('Erro ao adicionar coluna:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

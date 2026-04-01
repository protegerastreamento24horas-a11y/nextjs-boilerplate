import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API para verificar status das tabelas
export async function GET(request: NextRequest) {
  try {
    // Listar todas as tabelas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Verificar colunas da tabela Payment
    const paymentColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Payment'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      tables: tables,
      paymentColumns: paymentColumns,
      affiliateExists: Array.isArray(tables) && tables.some((t: any) => t.table_name === 'Affiliate')
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

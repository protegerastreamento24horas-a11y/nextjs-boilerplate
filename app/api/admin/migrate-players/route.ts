import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Verificar se as colunas já existem
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Payment' 
      AND column_name IN ('name', 'cpf', 'whatsapp')
    `;

    const existingColumns = (result as Array<{ column_name: string }>).map(r => r.column_name);

    // Adicionar colunas que não existem
    const queries = [];
    
    if (!existingColumns.includes('name')) {
      queries.push(prisma.$executeRaw`ALTER TABLE "Payment" ADD COLUMN "name" TEXT`);
    }
    
    if (!existingColumns.includes('cpf')) {
      queries.push(prisma.$executeRaw`ALTER TABLE "Payment" ADD COLUMN "cpf" TEXT`);
    }
    
    if (!existingColumns.includes('whatsapp')) {
      queries.push(prisma.$executeRaw`ALTER TABLE "Payment" ADD COLUMN "whatsapp" TEXT`);
    }

    // Executar todas as queries
    if (queries.length > 0) {
      await Promise.all(queries);
    }

    // Criar índice no cpf se não existir
    try {
      await prisma.$executeRaw`CREATE INDEX "Payment_cpf_idx" ON "Payment"("cpf")`;
    } catch {
      // Índice já pode existir, ignorar erro
    }

    return NextResponse.json({
      success: true,
      message: `Migração concluída. Colunas adicionadas: ${queries.length}`,
      columnsAdded: queries.length,
    });
  } catch (error: any) {
    console.error("Erro na migração:", error);
    return NextResponse.json(
      { error: "Erro ao executar migração", details: error.message },
      { status: 500 }
    );
  }
}

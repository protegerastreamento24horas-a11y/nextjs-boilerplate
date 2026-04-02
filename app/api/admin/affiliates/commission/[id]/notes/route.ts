import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/affiliates/commission/[id]/notes
// Adicionar ou atualizar nota em uma comissão específica
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { notes } = await req.json();

    // Validar entrada
    if (!id) {
      return NextResponse.json(
        { error: "ID da comissão é obrigatório" },
        { status: 400 }
      );
    }

    // Sanitizar nota
    const sanitizedNotes = notes 
      ? notes.toString().trim().substring(0, 500) 
      : null;

    // Verificar se a comissão existe
    const commission = await prisma.affiliateCommission.findUnique({
      where: { id }
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar nota
    const updated = await prisma.affiliateCommission.update({
      where: { id },
      data: { notes: sanitizedNotes }
    });

    return NextResponse.json({
      success: true,
      message: sanitizedNotes 
        ? "Nota adicionada com sucesso" 
        : "Nota removida",
      commission: updated
    });

  } catch (error: any) {
    console.error("[API] Erro ao atualizar nota:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar nota", details: error.message },
      { status: 500 }
    );
  }
}

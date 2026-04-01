import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/affiliates/[id] - Detalhes de um afiliado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      include: {
        commissions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        clicks: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Afiliado não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error("Erro ao buscar afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao buscar afiliado" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/affiliates/[id] - Atualizar afiliado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, name, email, phone, pixKey, pixKeyType, commissionRate } = body;

    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(pixKey && { pixKey }),
        ...(pixKeyType && { pixKeyType }),
        ...(commissionRate !== undefined && { commissionRate }),
      },
    });

    return NextResponse.json(affiliate);
  } catch (error: any) {
    console.error("Erro ao atualizar afiliado:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Afiliado não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro ao atualizar afiliado" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/affiliates/[id] - Remover afiliado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.affiliate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar afiliado:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Afiliado não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro ao deletar afiliado" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// GET /api/admin/affiliates/withdrawals - Listar solicitações de saque
export async function GET(request: NextRequest) {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    const where: any = {};
    if (status !== "all") {
      where.status = status;
    }

    const withdrawals = await prisma.affiliateWithdrawal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error("Erro ao listar saques:", error);
    return NextResponse.json(
      { error: "Erro ao listar saques" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/affiliates/withdrawals - Aprovar/rejeitar saque
export async function PATCH(request: NextRequest) {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID e status são obrigatórios" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.affiliateWithdrawal.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
        paidAt: status === "paid" ? new Date() : undefined,
      },
      include: {
        affiliate: true,
      },
    });

    // Se o saque foi pago, atualizar saldos do afiliado
    if (status === "paid") {
      await prisma.affiliate.update({
        where: { id: withdrawal.affiliateId },
        data: {
          pendingBalance: {
            decrement: withdrawal.amount,
          },
          paidBalance: {
            increment: withdrawal.amount,
          },
        },
      });
    }

    // Se o saque foi rejeitado, retornar valor ao saldo pendente
    if (status === "rejected") {
      await prisma.affiliate.update({
        where: { id: withdrawal.affiliateId },
        data: {
          pendingBalance: {
            increment: withdrawal.amount,
          },
        },
      });
    }

    return NextResponse.json(withdrawal);
  } catch (error: any) {
    console.error("Erro ao atualizar saque:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Saque não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro ao atualizar saque" },
      { status: 500 }
    );
  }
}

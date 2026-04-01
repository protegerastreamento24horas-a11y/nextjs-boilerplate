import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/affiliate/withdrawal - Solicitar saque
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateId, amount } = body;

    if (!affiliateId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "ID do afiliado e valor são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar afiliado
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Afiliado não encontrado" },
        { status: 404 }
      );
    }

    if (affiliate.status !== "active") {
      return NextResponse.json(
        { error: "Conta não está ativa" },
        { status: 403 }
      );
    }

    // Verificar saldo disponível
    if (affiliate.pendingBalance < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    // Valor mínimo de saque (R$ 50,00)
    if (amount < 50) {
      return NextResponse.json(
        { error: "Valor mínimo de saque é R$ 50,00" },
        { status: 400 }
      );
    }

    // Verificar se já existe saque pendente
    const pendingWithdrawal = await prisma.affiliateWithdrawal.findFirst({
      where: {
        affiliateId,
        status: "pending",
      },
    });

    if (pendingWithdrawal) {
      return NextResponse.json(
        { error: "Já existe uma solicitação de saque pendente" },
        { status: 400 }
      );
    }

    // Criar solicitação de saque
    const withdrawal = await prisma.affiliateWithdrawal.create({
      data: {
        affiliateId,
        amount,
        pixKey: affiliate.pixKey!,
        pixKeyType: affiliate.pixKeyType || "random",
        status: "pending",
      },
    });

    // Deduzir saldo pendente
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        pendingBalance: {
          decrement: amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Solicitação de saque enviada! Aguarde aprovação.",
      withdrawal,
    });
  } catch (error) {
    console.error("Erro ao solicitar saque:", error);
    return NextResponse.json(
      { error: "Erro ao solicitar saque" },
      { status: 500 }
    );
  }
}

// GET /api/affiliate/withdrawal - Listar saques do afiliado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get("affiliateId");

    if (!affiliateId) {
      return NextResponse.json(
        { error: "ID do afiliado não informado" },
        { status: 400 }
      );
    }

    const withdrawals = await prisma.affiliateWithdrawal.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
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

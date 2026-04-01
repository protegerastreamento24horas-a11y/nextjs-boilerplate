import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateShouldWin, generateGameResults, getOrCreateConfig } from "@/lib/game-logic";

// Função para gerar comissão do afiliado
async function generateAffiliateCommission(payment: any) {
  if (!payment.affiliateId || !payment.affiliateCode) {
    console.log("[Commission] Pagamento sem afiliado");
    return null;
  }

  try {
    // Buscar afiliado
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: payment.affiliateId },
    });

    if (!affiliate || affiliate.status !== "active") {
      console.log("[Commission] Afiliado não encontrado ou inativo");
      return null;
    }

    // Calcular comissão (10% do valor)
    const commissionRate = affiliate.commissionRate || 10;
    const commissionAmount = (payment.amount * commissionRate) / 100;

    // Criar registro de comissão
    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        paymentId: payment.id,
        amount: payment.amount,
        commission: commissionAmount,
        rate: commissionRate,
        status: "pending",
      },
    });

    // Atualizar saldo pendente do afiliado
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        pendingBalance: {
          increment: commissionAmount,
        },
        totalSales: {
          increment: 1,
        },
        conversions: {
          increment: 1,
        },
      },
    });

    console.log(`[Commission] Comissão de R$ ${commissionAmount.toFixed(2)} gerada para ${affiliate.name}`);
    return commission;
  } catch (error) {
    console.error("[Commission] Erro ao gerar comissão:", error);
    return null;
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  }

  if (payment.status === "paid") {
    // Já foi pago — retorna a sessão existente
    const existingSession = await prisma.gameSession.findUnique({
      where: { paymentId },
    });
    return NextResponse.json({ sessionId: existingSession?.id, status: "paid" });
  }

  const config = await getOrCreateConfig();

  // Decisão financeira inteligente
  const shouldWin = await calculateShouldWin(config);
  const results = generateGameResults(shouldWin);

  // Atualiza pagamento e cria sessão
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "paid" },
  });

  // Gerar comissão para afiliado (se houver)
  const commission = await generateAffiliateCommission(payment);

  const session = await prisma.gameSession.create({
    data: {
      paymentId,
      results: JSON.stringify(results),
      revealed: "[]",
      isWinner: false,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      event: "PAYMENT_CONFIRMED",
      data: JSON.stringify({
        paymentId,
        sessionId: session.id,
        shouldWin,
        amount: payment.amount,
        affiliateId: payment.affiliateId,
        commissionId: commission?.id,
      }),
    },
  });

  return NextResponse.json({ sessionId: session.id, status: "paid" });
}

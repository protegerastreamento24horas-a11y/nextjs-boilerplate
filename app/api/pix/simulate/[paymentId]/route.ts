import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateShouldWin, generateGameResults, getOrCreateConfig } from "@/lib/game-logic";

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
      }),
    },
  });

  return NextResponse.json({ sessionId: session.id, status: "paid" });
}

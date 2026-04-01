import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateShouldWin, generateGameResults, getOrCreateConfig } from "@/lib/game-logic";

// Webhook do Mercado Pago - confirmação de pagamento Pix
export async function POST(req: NextRequest) {
  try {
    // Verificar signature do webhook (opcional, mas recomendado)
    const signature = req.headers.get("x-signature");
    
    // Parse do body
    const body = await req.json();
    
    // Extrair dados do pagamento
    const { data, type } = body;
    
    // Apenas processar pagamentos
    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const mpPaymentId = String(data.id);
    
    // Buscar pagamento no banco pelo mpPaymentId
    const payment = await prisma.payment.findUnique({
      where: { mpPaymentId },
      include: { session: true },
    });

    if (!payment) {
      console.error("Pagamento não encontrado:", mpPaymentId);
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    // Se já processado, ignorar
    if (payment.status === "paid" && payment.session) {
      return NextResponse.json({ message: "Pagamento já processado" });
    }

    // Verificar status no Mercado Pago (opcional - pode confiar no webhook)
    // const mpStatus = await checkPaymentStatus(mpPaymentId);
    
    // Atualizar status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "paid" },
    });

    // Registrar transação de entrada
    await prisma.transaction.create({
      data: {
        type: "in",
        amount: payment.amount,
        description: "Pagamento Pix confirmado",
        paymentId: payment.id,
      },
    });

    // Lógica do jogo - decide se ganha
    const config = await getOrCreateConfig();
    const shouldWin = await calculateShouldWin(config, payment.amount);
    const results = generateGameResults(shouldWin);

    // Criar sessão de jogo
    const gameSession = await prisma.gameSession.create({
      data: {
        paymentId: payment.id,
        results: JSON.stringify(results),
        revealed: "[]",
        isWinner: false,
      },
    });

    // Se ganhou, registrar saída (prêmio)
    if (shouldWin) {
      await prisma.transaction.create({
        data: {
          type: "out",
          amount: config.custoPremio,
          description: "Prêmio de raspadinha",
          paymentId: payment.id,
        },
      });

      // Atualizar jackpot (resetar ou acumular)
      await prisma.config.update({
        where: { id: "default" },
        data: {
          jackpotAcumulado: { decrement: config.custoPremio },
          sequenciaSemPremio: 0,
        },
      });
    } else {
      // Acumular no jackpot
      const valorAcumular = payment.amount * 0.3; // 30% vai para jackpot
      await prisma.config.update({
        where: { id: "default" },
        data: {
          jackpotAcumulado: { increment: valorAcumular },
          sequenciaSemPremio: { increment: 1 },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        event: "PAYMENT_CONFIRMED_WEBHOOK",
        data: JSON.stringify({
          paymentId: payment.id,
          mpPaymentId,
          sessionId: gameSession.id,
          shouldWin,
          amount: payment.amount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      sessionId: gameSession.id,
      shouldWin,
    });

  } catch (error: any) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook", details: error.message },
      { status: 500 }
    );
  }
}

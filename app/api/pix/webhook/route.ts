import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateShouldWin, generateGameResults, getOrCreateConfig } from "@/lib/game-logic";

// Webhook do Mercado Pago - confirmação de pagamento Pix
// IMPORTANTE: Não deve ter autenticação - MP envia diretamente

// Handler para OPTIONS (preflight requests)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-signature",
    },
  });
}

// Handler principal para POST
export async function POST(req: NextRequest) {
  try {
    // Log para debug
    console.log("Webhook recebido:", {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url,
    });

    // Parse do body
    const body = await req.json();
    console.log("Body do webhook:", body);
    
    // Extrair dados do pagamento
    const { data, type } = body;
    
    // Apenas processar pagamentos
    if (type !== "payment" && !body.action?.includes("payment")) {
      console.log("Ignorando - não é pagamento:", type);
      return NextResponse.json({ received: true });
    }

    const mpPaymentId = String(data?.id || body.data?.id);
    
    if (!mpPaymentId || mpPaymentId === "undefined") {
      console.log("MP Payment ID inválido, ignorando");
      return NextResponse.json({ received: true, ignored: true });
    }

    console.log("Buscando pagamento:", mpPaymentId);
    
    // Buscar pagamento no banco pelo mpPaymentId
    const payment = await prisma.payment.findUnique({
      where: { mpPaymentId },
      include: { session: true },
    });

    if (!payment) {
      console.error("Pagamento não encontrado:", mpPaymentId);
      // Retorna 200 mesmo assim para MP parar de reenviar
      return NextResponse.json({ received: true, error: "Not found" });
    }

    // Se já processado, ignorar
    if (payment.status === "paid" && payment.session) {
      console.log("Pagamento já processado:", mpPaymentId);
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

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
        isWinner: shouldWin,
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

    console.log("Webhook processado com sucesso:", {
      paymentId: payment.id,
      shouldWin,
      sessionId: gameSession.id,
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      sessionId: gameSession.id,
      shouldWin,
    });

  } catch (error: any) {
    console.error("Erro no webhook:", error);
    // Sempre retorna 200 para MP não reenviar
    return NextResponse.json(
      { error: "Erro interno", details: error.message, received: true },
      { status: 200 }
    );
  }
}

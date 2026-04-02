import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateShouldWin, generateGameResults, getOrCreateConfig } from "@/lib/game-logic";

// Webhook para receber notificações de pagamento do Asaas
// Endpoint: POST /api/admin/affiliates/webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("[Webhook Asaas] Recebido:", JSON.stringify(body, null, 2));

    // Verificar se é um evento de pagamento confirmado
    if (body.event === "PAYMENT_RECEIVED" || body.event === "PAYMENT_CONFIRMED") {
      const paymentId = body.payment?.id;
      const externalReference = body.payment?.externalReference;
      const status = body.payment?.status;

      console.log(`[Webhook] Pagamento ${paymentId} - Status: ${status} - Ref: ${externalReference}`);

      if (externalReference) {
        // Buscar o pagamento no nosso banco
        const payment = await prisma.payment.findUnique({
          where: { id: externalReference },
          include: { session: true }
        });

        if (payment) {
          // Se já existe sessão, não recria
          if (payment.session) {
            console.log(`[Webhook] Sessão já existe para pagamento ${payment.id}`);
            return NextResponse.json({ received: true, message: "Sessão já existe" });
          }

          // Atualizar status do pagamento e data de pagamento
          await prisma.payment.update({
            where: { id: payment.id },
            data: { 
              status: "paid",
              mpPaymentId: paymentId,
              paidAt: new Date()
            }
          });

          // Criar GameSession com lógica inteligente de ganho
          const config = await getOrCreateConfig();
          const shouldWin = await calculateShouldWin(config);
          const results = generateGameResults(shouldWin);

          const session = await prisma.gameSession.create({
            data: {
              paymentId: payment.id,
              results: JSON.stringify(results),
              revealed: "[]",
              isWinner: false,
            }
          });

          // Log de auditoria
          await prisma.auditLog.create({
            data: {
              event: "PAYMENT_CONFIRMED_WEBHOOK",
              data: JSON.stringify({
                paymentId: payment.id,
                sessionId: session.id,
                shouldWin,
                amount: payment.amount,
                asaasPaymentId: paymentId,
              }),
            }
          });

          // Se tem afiliado, processar comissão
          if (payment.affiliateId) {
            await processAffiliateCommission(payment);
          }

          console.log(`[Webhook] Pagamento ${payment.id} confirmado. Sessão ${session.id} criada. shouldWin=${shouldWin}`);
        }
      }
    }

    // Sempre retornar 200 para o Asaas
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("[Webhook] Erro:", error);
    // Mesmo em erro, retornar 200 para evitar reenvios
    return NextResponse.json({ received: true, error: error.message });
  }
}

// Processar comissão do afiliado
async function processAffiliateCommission(payment: any) {
  try {
    if (!payment.affiliateId) return;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: payment.affiliateId }
    });

    if (!affiliate) return;

    const commissionRate = affiliate.commissionRate || 10;
    const commissionAmount = (payment.amount * commissionRate) / 100;

    // Criar registro de comissão
    await prisma.affiliateCommission.create({
      data: {
        affiliateId: payment.affiliateId,
        paymentId: payment.id,
        amount: payment.amount,
        commission: commissionAmount,
        rate: commissionRate,
        status: "approved"
      }
    });

    // Atualizar saldo do afiliado
    await prisma.affiliate.update({
      where: { id: payment.affiliateId },
      data: {
        totalEarnings: { increment: commissionAmount },
        pendingBalance: { increment: commissionAmount },
        totalSales: { increment: 1 },
        conversions: { increment: 1 }
      }
    });

    console.log(`[Webhook] Comissão de ${commissionAmount} criada para afiliado ${payment.affiliateId}`);

  } catch (error) {
    console.error("[Webhook] Erro ao processar comissão:", error);
  }
}

// Aceitar GET também (para testes)
export async function GET() {
  return NextResponse.json({ 
    message: "Webhook Asaas ativo",
    endpoints: {
      POST: "Receber notificações de pagamento"
    }
  });
}

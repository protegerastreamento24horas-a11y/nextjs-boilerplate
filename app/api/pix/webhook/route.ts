import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCashinPayWebhook, type CashinPayWebhookEvent } from "@/lib/cashinpay";
import { logWebhookReceived, logPaymentPaid, logPaymentExpired } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    // Obter o payload raw
    const payload = await req.text();
    
    // Obter assinatura do header
    const signature = req.headers.get("X-CashinPay-Signature") || "";
    
    // Validar assinatura
    const secret = process.env.CASHINPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Webhook] CASHINPAY_WEBHOOK_SECRET não configurado");
      return NextResponse.json(
        { error: "Webhook secret não configurado" },
        { status: 500 }
      );
    }
    
    const isValid = validateCashinPayWebhook(payload, signature, secret);
    if (!isValid) {
      console.error("[Webhook] Assinatura inválida");
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 401 }
      );
    }
    
    // Parse do evento
    const event = JSON.parse(payload) as CashinPayWebhookEvent;
    
    console.log("[Webhook] Evento recebido:", event.event, event.data.id);
    
    // Log do evento
    await logWebhookReceived("cashinpay", event.event, event.data.id);
    
    // Processar evento
    switch (event.event) {
      case "transaction.paid":
        await handleTransactionPaid(event.data);
        break;
        
      case "transaction.expired":
        await handleTransactionExpired(event.data);
        break;
        
      default:
        console.log("[Webhook] Evento não tratado:", event.event);
    }
    
    // Sempre retornar 200 imediatamente
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("[Webhook] Erro:", error);
    // Retornar 200 mesmo em caso de erro para evitar retries desnecessários
    // O ideal é logar o erro e investigar depois
    return NextResponse.json({ received: true });
  }
}

async function handleTransactionPaid(data: CashinPayWebhookEvent["data"]) {
  const paymentId = data.id;
  
  try {
    // Buscar o pagamento no banco
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) {
      console.error("[Webhook] Pagamento não encontrado:", paymentId);
      return;
    }
    
    // Verificar se já não foi processado
    if (payment.status === "paid") {
      console.log("[Webhook] Pagamento já processado:", paymentId);
      return;
    }
    
    // Atualizar status do pagamento
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });
    
    // Criar sessão de jogo
    const results = generateGameResults(payment.attempts);
    
    await prisma.gameSession.create({
      data: {
        paymentId: payment.id,
        results: JSON.stringify(results),
        revealed: "[]",
        isWinner: false, // Inicia como não vencedor - só muda quando revelar carta premiada
      },
    });
    
    // Se houver afiliado, criar comissão
    if (payment.affiliateId) {
      await createAffiliateCommission(payment.id, payment.amount, payment.affiliateId);
    }
    
    // Log de pagamento confirmado
    await logPaymentPaid(payment.id, data.amount.value, paymentId);
    
    console.log("[Webhook] Pagamento confirmado:", paymentId);
    
  } catch (error) {
    console.error("[Webhook] Erro ao processar pagamento:", error);
    throw error;
  }
}

async function handleTransactionExpired(data: CashinPayWebhookEvent["data"]) {
  const paymentId = data.id;
  
  try {
    // Buscar o pagamento no banco
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) {
      console.error("[Webhook] Pagamento não encontrado:", paymentId);
      return;
    }
    
    // Verificar se já não foi processado
    if (payment.status !== "pending") {
      console.log("[Webhook] Pagamento já processado:", paymentId);
      return;
    }
    
    // Atualizar status do pagamento
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "expired",
      },
    });
    
    await logPaymentExpired(payment.id, payment.amount);
    
    console.log("[Webhook] Pagamento expirado:", paymentId);
    
  } catch (error) {
    console.error("[Webhook] Erro ao processar expiração:", error);
    throw error;
  }
}

function generateGameResults(attempts: number): boolean[] {
  // Gera 10 posições (5x2 grid)
  const results: boolean[] = new Array(10).fill(false);
  
  // Lógica: 1 prêmio entre as 10 posições
  const prizeIndex = Math.floor(Math.random() * 10);
  results[prizeIndex] = true;
  
  return results;
}

async function createAffiliateCommission(
  paymentId: string,
  amount: number,
  affiliateId: string
) {
  if (!affiliateId) return;
  
  try {
    // Buscar afiliado
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });
    
    if (!affiliate || affiliate.status !== "active") {
      console.log("[Webhook] Afiliado não encontrado ou inativo");
      return;
    }
    
    // Calcular comissão
    const commission = (amount * affiliate.commissionRate) / 100;
    
    // Criar registro de comissão
    await prisma.affiliateCommission.create({
      data: {
        affiliateId: affiliateId,
        paymentId: paymentId,
        amount: amount,
        commission: commission,
        rate: affiliate.commissionRate,
        status: "approved",
      },
    });
    
    // Atualizar saldo do afiliado
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        totalEarnings: { increment: commission },
        pendingBalance: { increment: commission },
        totalSales: { increment: 1 },
        conversions: { increment: 1 },
      },
    });
    
    console.log("[Webhook] Comissão criada:", {
      affiliateId: affiliateId,
      commission,
    });
    
  } catch (error) {
    console.error("[Webhook] Erro ao criar comissão:", error);
  }
}

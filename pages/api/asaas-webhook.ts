import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { logWebhookReceived, logPaymentPaid, logGameSessionCreated } from "@/lib/audit";

// Webhook para receber notificações do Asaas
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log de TODAS as requisições recebidas
  console.log("[Asaas Webhook] ====== NOVA REQUISIÇÃO ======");
  console.log("[Asaas Webhook] Método:", req.method);
  console.log("[Asaas Webhook] URL:", req.url);
  console.log("[Asaas Webhook] Headers:", JSON.stringify(req.headers, null, 2));
  console.log("[Asaas Webhook] Body:", JSON.stringify(req.body, null, 2));
  console.log("[Asaas Webhook] ====== FIM REQUISIÇÃO ======");

  // Aceitar apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";

    console.log("[Asaas Webhook] Evento recebido:", JSON.stringify(event, null, 2));

    // Verificar se é evento de cobrança
    if (event.event !== "PAYMENT_RECEIVED" && event.event !== "PAYMENT_CONFIRMED") {
      console.log("[Asaas Webhook] Evento ignorado:", event.event);
      return res.status(200).json({ received: true, ignored: true });
    }

    const payment = event.payment;
    
    // Log webhook recebido
    await logWebhookReceived("asaas", event.event, payment?.id, ip);
    
    if (!payment || !payment.id) {
      console.error("[Asaas Webhook] Dados de pagamento inválidos");
      return res.status(400).json({ error: "Invalid payment data" });
    }

    // Buscar pagamento no banco pelo Asaas ID (armazenado em mpPaymentId)
    const dbPayment = await prisma.payment.findFirst({
      where: { mpPaymentId: payment.id },
    });

    if (!dbPayment) {
      console.error("[Asaas Webhook] Pagamento não encontrado:", payment.id);
      return res.status(404).json({ error: "Payment not found" });
    }

    // Verificar se já não foi processado
    if (dbPayment.status === "paid") {
      console.log("[Asaas Webhook] Pagamento já processado:", dbPayment.id);
      return res.status(200).json({ received: true, alreadyProcessed: true });
    }

    // Atualizar status do pagamento
    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: "paid",
      },
    });

    // Log pagamento confirmado
    await logPaymentPaid(dbPayment.id, dbPayment.amount, payment.id, ip);

    console.log("[Asaas Webhook] Pagamento atualizado:", dbPayment.id);

    // Criar sessão de jogo
    const gameSession = await prisma.gameSession.create({
      data: {
        paymentId: dbPayment.id,
        results: JSON.stringify([]),
        revealed: "[]",
        isWinner: false,
      },
    });

    console.log("[Asaas Webhook] Sessão de jogo criada:", gameSession.id);

    // Log sessão criada
    await logGameSessionCreated(gameSession.id, dbPayment.id, ip);

    return res.status(200).json({
      received: true,
      paymentId: dbPayment.id,
      sessionId: gameSession.id,
    });

  } catch (error: any) {
    console.error("[Asaas Webhook] Erro:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

// Configurar para não fazer parsing automático do body
export const config = {
  api: {
    bodyParser: true,
  },
};

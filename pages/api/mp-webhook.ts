import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Webhook do Mercado Pago - processa pagamentos Pix
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permitir CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Webhook MP recebido");
    console.log("Body:", req.body);

    const { data, type, action } = req.body;

    // Apenas processar eventos de pagamento
    if (!type?.includes("payment") && !action?.includes("payment")) {
      console.log("Ignorando - não é evento de pagamento");
      return res.status(200).json({ received: true, ignored: true });
    }

    const mpPaymentId = String(data?.id || "123456");
    
    // Buscar pagamento no banco
    const payment = await prisma.payment.findUnique({
      where: { mpPaymentId },
      include: { session: true },
    });

    if (!payment) {
      console.error("Pagamento não encontrado:", mpPaymentId);
      return res.status(200).json({ received: true, error: "Payment not found" });
    }

    // Se já processado, ignorar
    if (payment.status === "paid" && payment.session) {
      console.log("Pagamento já processado:", mpPaymentId);
      return res.status(200).json({ received: true, alreadyProcessed: true });
    }

    // Atualizar status para pago
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: "paid",
        updatedAt: new Date(),
      },
    });

    // Registrar transação
    await prisma.transaction.create({
      data: {
        type: "in",
        amount: payment.amount,
        description: "Pagamento Pix confirmado",
        paymentId: payment.id,
      },
    });

    // Criar sessão de jogo
    const gameSession = await prisma.gameSession.create({
      data: {
        paymentId: payment.id,
        results: JSON.stringify([false, false, true, false, false, false, false, false, false]),
        revealed: "[]",
        isWinner: false,
      },
    });

    console.log("Pagamento processado com sucesso:", {
      paymentId: payment.id,
      sessionId: gameSession.id,
    });

    return res.status(200).json({
      success: true,
      paymentId: payment.id,
      sessionId: gameSession.id,
    });

  } catch (error: any) {
    console.error("Erro no webhook:", error);
    return res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
}

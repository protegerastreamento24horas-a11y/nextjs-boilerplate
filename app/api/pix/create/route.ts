import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAsaasPixPayment } from "@/lib/asaas";

export async function POST(req: NextRequest) {
  try {
    const { quantity, amount } = await req.json();

    // Criar registro no banco
    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        attempts: Number(quantity) || 1,
        status: "pending",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      },
    });

    // Verificar se tem API key do Asaas configurada
    const hasAsaas = !!process.env.ASAAS_API_KEY;

    if (hasAsaas) {
      // Criar pagamento real no Asaas
      console.log("[API] Tentando criar pagamento no Asaas...");
      const asaasResult = await createAsaasPixPayment(
        Number(amount),
        `Raspadinha - ${quantity} tentativa(s)`,
        payment.id
      );
      
      console.log("[API] Resultado Asaas:", JSON.stringify(asaasResult, null, 2));

      if (asaasResult.success && asaasResult.paymentId) {
        // Atualizar com dados do Asaas
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            mpPaymentId: asaasResult.paymentId, // Reutilizando campo para Asaas ID
            qrCode: asaasResult.qrCode,
            qrCodeText: asaasResult.qrCodeText,
          },
        });

        return NextResponse.json({
          paymentId: payment.id,
          mpPaymentId: asaasResult.paymentId,
          qrCode: asaasResult.qrCode,
          qrCodeText: asaasResult.qrCodeText,
          ticketUrl: asaasResult.invoiceUrl,
          amount: payment.amount,
          isReal: true,
        });
      } else {
        console.warn("[API] Falha ao criar Pix no Asaas:", asaasResult.error);
      }
    } else {
      console.log("[API] API key Asaas não configurada");
    }

    // Modo simulação (fallback ou sem Asaas configurado)
    const pixId = crypto.randomUUID();
    await prisma.payment.update({
      where: { id: payment.id },
      data: { pixId },
    });

    return NextResponse.json({
      paymentId: payment.id,
      pixId,
      amount: payment.amount,
      isReal: false,
      message: hasAsaas 
        ? "Pagamento criado em modo simulação (fallback)" 
        : "Configure ASAAS_API_KEY para Pix real",
    });

  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento", details: error.message },
      { status: 500 }
    );
  }
}

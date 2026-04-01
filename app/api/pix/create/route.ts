import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixPayment } from "@/lib/mercado-pago";

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

    // Verificar se tem token do Mercado Pago configurado
    const hasMP = !!process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (hasMP) {
      // Criar pagamento real no Mercado Pago
      console.log("[API] Tentando criar pagamento no MP...");
      const mpResult = await createPixPayment(
        Number(amount),
        `Raspadinha - ${quantity} tentativa(s)`,
        payment.id
      );
      
      console.log("[API] Resultado MP:", JSON.stringify(mpResult, null, 2));

      if (mpResult.success && mpResult.mpPaymentId) {
        // Atualizar com dados do MP
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            mpPaymentId: mpResult.mpPaymentId,
            qrCode: mpResult.qrCode,
            qrCodeText: mpResult.qrCodeText,
          },
        });

        return NextResponse.json({
          paymentId: payment.id,
          mpPaymentId: mpResult.mpPaymentId,
          qrCode: mpResult.qrCode,
          qrCodeText: mpResult.qrCodeText,
          ticketUrl: mpResult.ticketUrl,
          amount: payment.amount,
          isReal: true,
        });
      } else {
        console.warn("[API] Falha ao criar Pix no MP:", mpResult.error);
      }
    } else {
      console.log("[API] Token MP não configurado");
    }

    // Modo simulação (fallback ou sem MP configurado)
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
      message: hasMP 
        ? "Pagamento criado em modo simulação (fallback)" 
        : "Configure MERCADO_PAGO_ACCESS_TOKEN para Pix real",
    });

  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento", details: error.message },
      { status: 500 }
    );
  }
}

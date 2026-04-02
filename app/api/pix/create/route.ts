import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAsaasPixPayment } from "@/lib/asaas";
import { logPaymentCreated } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { quantity, amount, cpf, name, whatsapp, affiliateCode } = await req.json();

    // Pegar IP do header
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Buscar afiliado se houver código
    let affiliateId = null;
    let savedAffiliateCode = null;
    if (affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { code: affiliateCode.toUpperCase() },
      });
      if (affiliate && affiliate.status === "active") {
        affiliateId = affiliate.id;
        savedAffiliateCode = affiliate.code;
      }
    }

    // Criar registro no banco
    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        attempts: Number(quantity) || 1,
        status: "pending",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        name: name || null,
        cpf: cpf || null,
        whatsapp: whatsapp || null,
        affiliateId,
        affiliateCode: savedAffiliateCode,
      },
    });

    // Log pagamento criado
    await logPaymentCreated(payment.id, payment.amount, payment.attempts, ip);

    // Verificar modo Demo/Real no banco de dados
    const config = await prisma.config.findUnique({
      where: { id: "default" },
    });
    const isModoDemo = config?.modoDemo ?? true; // Default: Demo

    console.log("[API] Modo de operação:", isModoDemo ? "DEMO (simulado)" : "REAL (Asaas)");

    // Se estiver em modo Demo, usar simulação direto
    if (isModoDemo) {
      console.log("[API] Modo Demo ativo - usando PIX simulado");
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
        isDemo: true,
        message: "🎮 Modo Demo - PIX simulado sem cobrança real",
      });
    }

    // Modo Real - tentar usar Asaas
    console.log("[API] Modo Real ativo - tentando gerar PIX real");

    // Verificar se tem API key do Asaas configurada
    const hasAsaas = !!process.env.ASAAS_API_KEY;
    console.log("[API] ASAAS_API_KEY configurada:", hasAsaas);
    console.log("[API] ASAAS_SANDBOX:", process.env.ASAAS_SANDBOX);

    if (!hasAsaas) {
      return NextResponse.json(
        { 
          error: "Modo Real ativo mas ASAAS_API_KEY não configurada", 
          details: "Configure a chave API do Asaas nas variáveis de ambiente ou ative o Modo Demo",
        },
        { status: 500 }
      );
    }

    // Criar pagamento real no Asaas
    console.log("[API] Tentando criar pagamento no Asaas...", { amount: Number(amount), quantity, cpf, name });
    const asaasResult = await createAsaasPixPayment(
      Number(amount),
      `Raspadinha - ${quantity} tentativa(s)`,
      payment.id,
      cpf || undefined,
      name || undefined
    );
    
    console.log("[API] Resultado Asaas:", JSON.stringify(asaasResult, null, 2));

    if (asaasResult.success && asaasResult.paymentId && asaasResult.qrCode) {
      // Atualizar com dados do Asaas
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          mpPaymentId: asaasResult.paymentId,
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
      // Retornar erro ao invés de fallback silencioso
      return NextResponse.json(
        { 
          error: "Falha ao gerar QR Code PIX", 
          details: asaasResult.error || "Resposta inválida do Asaas",
          asaasConfigured: true,
          asaasError: asaasResult.error,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento", details: error.message },
      { status: 500 }
    );
  }
}

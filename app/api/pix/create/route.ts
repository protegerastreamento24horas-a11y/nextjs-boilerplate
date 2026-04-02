import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAsaasPixPayment } from "@/lib/asaas";
import { logPaymentCreated } from "@/lib/audit";

// Funções de validação e sanitização
function sanitizeString(input: string | null | undefined, maxLength: number = 255): string | null {
  if (!input) return null;
  // Remove caracteres perigosos e trim
  let sanitized = input.trim().replace(/[<>\"'%;()&+]/g, "");
  // Limita tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized || null;
}

function validateCPF(cpf: string | null | undefined): string | null {
  if (!cpf) return null;
  // Remove não-numéricos
  const cleaned = cpf.replace(/\D/g, "");
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return null;
  // Verifica CPFs inválidos conhecidos
  if (/^(\d)\1{10}$/.test(cleaned)) return null;
  return cleaned;
}

function validateWhatsApp(whatsapp: string | null | undefined): string | null {
  if (!whatsapp) return null;
  // Remove não-numéricos
  const cleaned = whatsapp.replace(/\D/g, "");
  // Verifica se tem entre 10 e 13 dígitos (com ou sem código do país)
  if (cleaned.length < 10 || cleaned.length > 13) return null;
  return cleaned;
}

function validateName(name: string | null | undefined): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  // Mínimo 2 caracteres, máximo 100
  if (trimmed.length < 2 || trimmed.length > 100) return null;
  // Apenas letras, espaços e caracteres comuns de nomes
  if (!/^[\p{L}\s'-]+$/u.test(trimmed)) return null;
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const { quantity, amount, cpf, name, whatsapp, affiliateCode } = await req.json();

    // Validar e sanitizar entradas
    const sanitizedName = validateName(name);
    const sanitizedCPF = validateCPF(cpf);
    const sanitizedWhatsApp = validateWhatsApp(whatsapp);
    const sanitizedAffiliateCode = sanitizeString(affiliateCode, 20);

    // Validar amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000) {
      return NextResponse.json(
        { error: "Valor inválido" },
        { status: 400 }
      );
    }

    // Validar quantity
    const numQuantity = Number(quantity) || 1;
    if (numQuantity < 1 || numQuantity > 100) {
      return NextResponse.json(
        { error: "Quantidade inválida" },
        { status: 400 }
      );
    }

    // Pegar IP do header
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Buscar afiliado se houver código
    let affiliateId = null;
    let savedAffiliateCode = null;
    if (sanitizedAffiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { code: sanitizedAffiliateCode.toUpperCase() },
      });
      if (affiliate && affiliate.status === "active") {
        affiliateId = affiliate.id;
        savedAffiliateCode = affiliate.code;
      }
    }

    // Criar registro no banco
    const payment = await prisma.payment.create({
      data: {
        amount: numAmount,
        attempts: numQuantity,
        status: "pending",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        name: sanitizedName,
        cpf: sanitizedCPF,
        whatsapp: sanitizedWhatsApp,
        affiliateId,
        affiliateCode: savedAffiliateCode,
      },
    });

    // Log pagamento criado
    await logPaymentCreated(payment.id, payment.amount, payment.attempts, ip);

    // Modo Real - usar Asaas
    console.log("[API] Modo Real - tentando gerar PIX real");

    // Verificar se tem API key do Asaas configurada
    const hasAsaas = !!process.env.ASAAS_API_KEY;
    console.log("[API] ASAAS_API_KEY configurada:", hasAsaas);
    console.log("[API] ASAAS_SANDBOX:", process.env.ASAAS_SANDBOX);

    if (!hasAsaas) {
      return NextResponse.json(
        { 
          error: "ASAAS_API_KEY não configurada", 
          details: "Configure a chave API do Asaas nas variáveis de ambiente",
        },
        { status: 500 }
      );
    }

    // Criar pagamento real no Asaas
    console.log("[API] Tentando criar pagamento no Asaas...", { amount: numAmount, quantity: numQuantity, cpf: sanitizedCPF, name: sanitizedName });
    const asaasResult = await createAsaasPixPayment(
      numAmount,
      `Raspadinha - ${numQuantity} tentativa(s)`,
      payment.id,
      sanitizedCPF || undefined,
      sanitizedName || undefined
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

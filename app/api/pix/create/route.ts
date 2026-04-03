import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCashinPayPixPayment } from "@/lib/cashinpay";
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
  if (!/[\p{L}\s'-]+/u.test(trimmed)) return null;
  return trimmed;
}

function validateEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  // Regex simples para validação de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const { quantity, amount, cpf, name, whatsapp, email, affiliateCode, raffleId } = await req.json();

    // Validar e sanitizar entradas
    const sanitizedName = validateName(name);
    const sanitizedCPF = validateCPF(cpf);
    const sanitizedWhatsApp = validateWhatsApp(whatsapp);
    const sanitizedEmail = validateEmail(email);
    const sanitizedAffiliateCode = sanitizeString(affiliateCode, 20);
    const sanitizedRaffleId = sanitizeString(raffleId, 100);

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
        email: sanitizedEmail,
        affiliateId,
        affiliateCode: savedAffiliateCode,
        raffleId: sanitizedRaffleId,
      },
    });

    // Log pagamento criado
    await logPaymentCreated(payment.id, payment.amount, payment.attempts, ip);

    // Usar CashinPay
    console.log("[API] Modo CashinPay - criando transação PIX");

    // Verificar se tem API key do CashinPay configurada
    const hasCashinPay = !!process.env.CASHINPAY_API_KEY;
    console.log("[API] CASHINPAY_API_KEY configurada:", hasCashinPay);

    if (!hasCashinPay) {
      return NextResponse.json(
        { 
          error: "CASHINPAY_API_KEY não configurada", 
          details: "Configure a chave API da CashinPay nas variáveis de ambiente",
        },
        { status: 500 }
      );
    }

    // Criar transação no CashinPay
    const customerName = sanitizedName || `Cliente ${payment.id.slice(-8)}`;
    const customerEmail = sanitizedEmail || `cliente-${payment.id.slice(-8)}@raspadinha.com`;
    const customerPhone = sanitizedWhatsApp || "11999999999";

    console.log("[API] Tentando criar transação no CashinPay...", { 
      amount: numAmount, 
      quantity: numQuantity,
      paymentId: payment.id 
    });

    const cashinPayResult = await createCashinPayPixPayment(
      numAmount,
      `Raspadinha - ${numQuantity} tentativa(s)`,
      payment.id,
      {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        document: sanitizedCPF || undefined,
      }
    );
    
    console.log("[API] Resultado CashinPay:", JSON.stringify(cashinPayResult, null, 2));

    if (cashinPayResult.success && cashinPayResult.paymentId && cashinPayResult.qrCode) {
      // Atualizar com dados do CashinPay
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          mpPaymentId: cashinPayResult.paymentId,
          qrCode: cashinPayResult.qrCode,
          qrCodeText: cashinPayResult.qrCode,
        },
      });

      return NextResponse.json({
        paymentId: payment.id,
        mpPaymentId: cashinPayResult.paymentId,
        qrCode: cashinPayResult.qrCode,
        qrCodeText: cashinPayResult.qrCode,
        amount: payment.amount,
        isReal: true,
      });
    } else {
      console.warn("[API] Falha ao criar Pix no CashinPay:", cashinPayResult.error);
      return NextResponse.json(
        { 
          error: "Falha ao gerar QR Code PIX", 
          details: cashinPayResult.error || "Resposta inválida da CashinPay",
          cashinPayConfigured: true,
          cashinPayError: cashinPayResult.error,
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error("Erro ao criar pagamento:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao criar pagamento", details: errorMessage },
      { status: 500 }
    );
  }
}

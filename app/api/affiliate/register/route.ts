import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/affiliate/register - Registrar novo afiliado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, cpf, pixKey, pixKeyType } = body;

    // Validar campos obrigatórios
    if (!name || !email || !cpf || !pixKey) {
      return NextResponse.json(
        { error: "Nome, email, CPF e chave PIX são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe afiliado com este email ou CPF
    const existing = await prisma.affiliate.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email ou CPF já cadastrado" },
        { status: 400 }
      );
    }

    // Gerar código único
    const code = generateAffiliateCode(name);

    const affiliate = await prisma.affiliate.create({
      data: {
        code,
        name,
        email,
        phone,
        cpf,
        pixKey,
        pixKeyType: pixKeyType || detectPixKeyType(pixKey),
        status: "pending", // Aguardando aprovação do admin
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cadastro realizado! Aguarde aprovação.",
      affiliate: {
        id: affiliate.id,
        code: affiliate.code,
        name: affiliate.name,
        status: affiliate.status,
      },
    });
  } catch (error: any) {
    console.error("Erro ao registrar afiliado:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou código já cadastrado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao registrar afiliado" },
      { status: 500 }
    );
  }
}

// GET /api/affiliate/register - Verificar se código está disponível
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Código não informado" },
        { status: 400 }
      );
    }

    const existing = await prisma.affiliate.findUnique({
      where: { code },
    });

    return NextResponse.json({
      available: !existing,
      code,
    });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return NextResponse.json(
      { error: "Erro ao verificar código" },
      { status: 500 }
    );
  }
}

function generateAffiliateCode(name: string): string {
  const prefix = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 3);

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${prefix}${random}`;

  return code;
}

function detectPixKeyType(key: string): string {
  // CPF: 11 dígitos
  if (/^\d{11}$/.test(key.replace(/\D/g, ""))) {
    return "cpf";
  }
  // CNPJ: 14 dígitos
  if (/^\d{14}$/.test(key.replace(/\D/g, ""))) {
    return "cnpj";
  }
  // Email: contém @
  if (key.includes("@")) {
    return "email";
  }
  // Telefone: começa com + ou tem 10-11 dígitos
  if (/^\+?\d{10,11}$/.test(key.replace(/\D/g, ""))) {
    return "phone";
  }
  // Chave aleatória
  return "random";
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Listar todos os afiliados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    
    if (status && status !== "all") {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const affiliates = await prisma.affiliate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            commissions: true,
            withdrawals: true,
            clicks: true,
          },
        },
      },
    });

    return NextResponse.json(affiliates);
  } catch (error) {
    console.error("Erro ao listar afiliados:", error);
    return NextResponse.json(
      { error: "Erro ao listar afiliados" },
      { status: 500 }
    );
  }
}

// Criar novo afiliado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, cpf, pixKey, pixKeyType, commissionRate } = body;

    // Validar campos obrigatórios
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Gerar código único do afiliado
    const code = generateAffiliateCode(name);

    const affiliate = await prisma.affiliate.create({
      data: {
        code,
        name,
        email,
        phone,
        cpf,
        pixKey,
        pixKeyType,
        commissionRate: commissionRate || 10.0,
        status: "active", // Admin cria direto ativo
      },
    });

    return NextResponse.json(affiliate);
  } catch (error: any) {
    console.error("Erro ao criar afiliado:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou código já cadastrado" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro ao criar afiliado" },
      { status: 500 }
    );
  }
}

// Gerar código único para afiliado
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

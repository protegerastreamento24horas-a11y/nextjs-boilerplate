import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/affiliate/click - Registrar clique no link de afiliado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Código do afiliado não informado" },
        { status: 400 }
      );
    }

    // Verificar se afiliado existe e está ativo
    const affiliate = await prisma.affiliate.findUnique({
      where: { code },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Afiliado não encontrado" },
        { status: 404 }
      );
    }

    if (affiliate.status !== "active") {
      return NextResponse.json(
        { error: "Afiliado não está ativo" },
        { status: 403 }
      );
    }

    // Coletar informações do visitante
    const ip = request.headers.get("x-forwarded-for") ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer") || null;

    // Registrar clique
    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        ip: ip.split(",")[0].trim(), // Pegar apenas o primeiro IP
        userAgent,
        referrer,
      },
    });

    // Incrementar contador de cliques do afiliado
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        code: affiliate.code,
        name: affiliate.name,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
    return NextResponse.json(
      { error: "Erro ao registrar clique" },
      { status: 500 }
    );
  }
}

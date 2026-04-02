import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST /api/admin/raffles - Criar novo sorteio
export async function POST(request: NextRequest) {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const {
      slug,
      name,
      description,
      fullDescription,
      homeBanner,
      pageBanner,
      logoUrl,
      primaryColor,
      secondaryColor,
      packages,
    } = body;

    // Validações
    if (!slug || !name) {
      return NextResponse.json(
        { error: "Slug e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se slug já existe
    const existing = await prisma.raffle.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um sorteio com este slug" },
        { status: 400 }
      );
    }

    const raffle = await prisma.raffle.create({
      data: {
        slug,
        name,
        description: description || null,
        fullDescription: fullDescription || null,
        homeBanner: homeBanner || null,
        pageBanner: pageBanner || null,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || "#FFD700",
        secondaryColor: secondaryColor || "#FFA500",
        packages: packages ? JSON.stringify(packages) : undefined,
        isActive: true,
      },
    });

    return NextResponse.json(raffle);
  } catch (error) {
    console.error("Erro ao criar sorteio:", error);
    return NextResponse.json(
      { error: "Erro ao criar sorteio" },
      { status: 500 }
    );
  }
}

// GET /api/admin/raffles - Listar todos os sorteios (admin)
export async function GET() {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const raffles = await prisma.raffle.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(raffles);
  } catch (error) {
    console.error("Erro ao listar sorteios:", error);
    return NextResponse.json(
      { error: "Erro ao listar sorteios" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Configurar limite do body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// GET /api/raffles/[slug] - Detalhes de um sorteio específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const raffle = await prisma.raffle.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        fullDescription: true,
        isActive: true,
        order: true,
        homeBanner: true,
        pageBanner: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        packages: true,
        totalParticipants: true,
        totalWinners: true,
      },
    });

    if (!raffle) {
      return NextResponse.json(
        { error: "Sorteio não encontrado" },
        { status: 404 }
      );
    }

    if (!raffle.isActive) {
      return NextResponse.json(
        { error: "Sorteio inativo" },
        { status: 403 }
      );
    }

    return NextResponse.json(raffle);
  } catch (error) {
    console.error("Erro ao buscar sorteio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sorteio" },
      { status: 500 }
    );
  }
}

// PUT /api/raffles/[slug] - Atualizar sorteio (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    
    const {
      name,
      description,
      fullDescription,
      isActive,
      order,
      homeBanner,
      pageBanner,
      logoUrl,
      primaryColor,
      secondaryColor,
      packages,
    } = body;

    const raffle = await prisma.raffle.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(fullDescription !== undefined && { fullDescription }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
        ...(homeBanner !== undefined && { homeBanner }),
        ...(pageBanner !== undefined && { pageBanner }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(packages && { packages: JSON.stringify(packages) }),
      },
    });

    return NextResponse.json(raffle);
  } catch (error) {
    console.error("Erro ao atualizar sorteio:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar sorteio" },
      { status: 500 }
    );
  }
}

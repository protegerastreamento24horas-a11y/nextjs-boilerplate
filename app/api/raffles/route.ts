import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/raffles - Listar todos os sorteios ativos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";
    
    const where = includeInactive ? {} : { isActive: true };
    
    const raffles = await prisma.raffle.findMany({
      where,
      orderBy: { order: "asc" },
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

    return NextResponse.json(raffles);
  } catch (error) {
    console.error("Erro ao listar sorteios:", error);
    return NextResponse.json(
      { error: "Erro ao listar sorteios" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/admin/site-config - Buscar configurações do site
export async function GET() {
  try {
    const config = await prisma.config.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      // Cria configuração padrão se não existir
      const newConfig = await prisma.config.create({
        data: { id: "default" },
      });
      return NextResponse.json(newConfig);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao buscar config:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/site-config - Atualizar configurações (admin only)
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      mainBannerUrl,
      mainBannerUrl2,
      mainBannerUrl3,
      mainBannerUrl4,
      mainBannerUrl5,
      mainBannerLink,
      mainBannerActive,
      popupImageUrl,
      popupLink,
      popupActive,
      popupDelay,
    } = body;

    const config = await prisma.config.upsert({
      where: { id: "default" },
      update: {
        ...(mainBannerUrl !== undefined && { mainBannerUrl }),
        ...(mainBannerUrl2 !== undefined && { mainBannerUrl2 }),
        ...(mainBannerUrl3 !== undefined && { mainBannerUrl3 }),
        ...(mainBannerUrl4 !== undefined && { mainBannerUrl4 }),
        ...(mainBannerUrl5 !== undefined && { mainBannerUrl5 }),
        ...(mainBannerLink !== undefined && { mainBannerLink }),
        ...(mainBannerActive !== undefined && { mainBannerActive }),
        ...(popupImageUrl !== undefined && { popupImageUrl }),
        ...(popupLink !== undefined && { popupLink }),
        ...(popupActive !== undefined && { popupActive }),
        ...(popupDelay !== undefined && { popupDelay }),
      },
      create: {
        id: "default",
        mainBannerUrl,
        mainBannerUrl2,
        mainBannerUrl3,
        mainBannerUrl4,
        mainBannerUrl5,
        mainBannerLink,
        mainBannerActive: mainBannerActive ?? true,
        popupImageUrl,
        popupLink,
        popupActive: popupActive ?? false,
        popupDelay: popupDelay ?? 3,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao atualizar config:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}

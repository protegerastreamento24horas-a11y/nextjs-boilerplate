import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/affiliate/dashboard - Dashboard do afiliado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Código do afiliado não informado" },
        { status: 400 }
      );
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { code },
      include: {
        commissions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            clicks: true,
            commissions: true,
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Afiliado não encontrado" },
        { status: 404 }
      );
    }

    if (affiliate.status === "blocked") {
      return NextResponse.json(
        { error: "Conta bloqueada" },
        { status: 403 }
      );
    }

    // Estatísticas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await prisma.affiliateCommission.groupBy({
      by: ["status"],
      where: {
        affiliateId: affiliate.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { commission: true, amount: true },
      _count: { id: true },
    });

    // Construir link de afiliado - usar domínio correto do Vercel
    const baseUrl = "https://nextjs-boilerplate-qz9nwoyzb.vercel.app";
    const affiliateLink = `${baseUrl}/?ref=${affiliate.code}`;

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        code: affiliate.code,
        name: affiliate.name,
        email: affiliate.email,
        status: affiliate.status,
        commissionRate: affiliate.commissionRate,
        totalEarnings: affiliate.totalEarnings,
        pendingBalance: affiliate.pendingBalance,
        paidBalance: affiliate.paidBalance,
        totalSales: affiliate.totalSales,
        totalClicks: affiliate.totalClicks,
        pixKey: affiliate.pixKey,
        pixKeyType: affiliate.pixKeyType,
      },
      affiliateLink,
      recentStats,
      recentCommissions: affiliate.commissions,
      recentWithdrawals: affiliate.withdrawals,
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dashboard" },
      { status: 500 }
    );
  }
}

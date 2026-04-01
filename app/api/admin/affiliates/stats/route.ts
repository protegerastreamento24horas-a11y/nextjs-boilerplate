import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/affiliates/stats - Estatísticas do dashboard
export async function GET() {
  try {
    // Total de afiliados
    const totalAffiliates = await prisma.affiliate.count();
    const activeAffiliates = await prisma.affiliate.count({
      where: { status: "active" },
    });
    const pendingAffiliates = await prisma.affiliate.count({
      where: { status: "pending" },
    });
    const blockedAffiliates = await prisma.affiliate.count({
      where: { status: "blocked" },
    });

    // Total de vendas via afiliados
    const totalSales = await prisma.affiliateCommission.count({
      where: { status: { in: ["approved", "paid"] } },
    });

    // Total de comissões
    const commissions = await prisma.affiliateCommission.aggregate({
      _sum: { commission: true },
      where: { status: { in: ["approved", "paid"] } },
    });

    // Comissões pendentes
    const pendingCommissions = await prisma.affiliateCommission.aggregate({
      _sum: { commission: true },
      where: { status: "pending" },
    });

    // Total pago em saques
    const totalPaid = await prisma.affiliateWithdrawal.aggregate({
      _sum: { amount: true },
      where: { status: "paid" },
    });

    // Saques pendentes
    const pendingWithdrawals = await prisma.affiliateWithdrawal.count({
      where: { status: "pending" },
    });

    // Top afiliados
    const topAffiliates = await prisma.affiliate.findMany({
      take: 5,
      orderBy: { totalEarnings: "desc" },
      select: {
        id: true,
        name: true,
        code: true,
        totalEarnings: true,
        totalSales: true,
      },
    });

    // Vendas dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSales = await prisma.affiliateCommission.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { in: ["approved", "paid"] },
      },
      _count: { id: true },
      _sum: { commission: true },
    });

    return NextResponse.json({
      overview: {
        totalAffiliates,
        activeAffiliates,
        pendingAffiliates,
        blockedAffiliates,
        totalSales,
        totalCommissions: commissions._sum?.commission || 0,
        pendingCommissions: pendingCommissions._sum?.commission || 0,
        totalPaid: totalPaid._sum?.amount || 0,
        pendingWithdrawals,
      },
      topAffiliates,
      recentSales,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

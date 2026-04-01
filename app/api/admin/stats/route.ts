import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    arrecadadoResult,
    totalJogadas,
    premiosPagos,
    config,
    recentSessions,
    paymentsByStatus,
    recentPayments,
    salesLast30Days,
    todayRevenue,
    totalPaymentsCount,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.gameSession.count(),
    prisma.gameSession.count({ where: { isWinner: true } }),
    prisma.config.findUnique({ where: { id: "default" } }),
    prisma.gameSession.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { payment: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.payment.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { session: true },
    }),
    prisma.payment.findMany({
      where: {
        status: "paid",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: "paid",
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    }),
    prisma.payment.count(),
  ]);

  const totalArrecadado = arrecadadoResult._sum.amount ?? 0;
  const custoPremio = config?.custoPremio ?? 50;
  const lucroAtual = totalArrecadado - premiosPagos * custoPremio;

  const salesByDay = new Map<string, { amount: number; count: number }>();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    salesByDay.set(dateStr, { amount: 0, count: 0 });
  }

  salesLast30Days.forEach((payment) => {
    const dateStr = payment.createdAt.toISOString().split("T")[0];
    const current = salesByDay.get(dateStr) || { amount: 0, count: 0 };
    salesByDay.set(dateStr, {
      amount: current.amount + payment.amount,
      count: current.count + 1,
    });
  });

  const salesData = Array.from(salesByDay.entries())
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const statusCounts = { pending: 0, paid: 0, expired: 0 };
  paymentsByStatus.forEach((item) => {
    if (item.status === "pending") statusCounts.pending = item._count.id;
    if (item.status === "paid") statusCounts.paid = item._count.id;
    if (item.status === "expired") statusCounts.expired = item._count.id;
  });

  const todayRevenueValue = todayRevenue._sum.amount ?? 0;
  const avgTicket = arrecadadoResult._count > 0 
    ? totalArrecadado / arrecadadoResult._count 
    : 0;
  const conversionRate = totalPaymentsCount > 0 
    ? (arrecadadoResult._count / totalPaymentsCount) * 100 
    : 0;
  const winRate = totalJogadas > 0 
    ? (premiosPagos / totalJogadas) * 100 
    : 0;

  return NextResponse.json({
    totalArrecadado,
    totalPagamentos: arrecadadoResult._count,
    totalJogadas,
    premiosPagos,
    lucroAtual,
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      isWinner: s.isWinner,
      amount: s.payment.amount,
      createdAt: s.createdAt,
    })),
    salesData,
    paymentsByStatus: statusCounts,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      attempts: p.attempts,
      createdAt: p.createdAt,
      session: p.session,
    })),
    topStats: {
      avgTicket,
      conversionRate,
      winRate,
      todayRevenue: todayRevenueValue,
    },
  });
}

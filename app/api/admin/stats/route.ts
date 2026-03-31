import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [arrecadadoResult, totalJogadas, premiosPagos, config, recentSessions] =
    await Promise.all([
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
    ]);

  const totalArrecadado = arrecadadoResult._sum.amount ?? 0;
  const custoPremio = config?.custoPremio ?? 50;
  const lucroAtual = totalArrecadado - premiosPagos * custoPremio;

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
  });
}

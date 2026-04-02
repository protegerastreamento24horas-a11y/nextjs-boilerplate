import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Buscar todos os pagamentos com dados do cliente e sessões
    const payments = await prisma.payment.findMany({
      where: {
        cpf: { not: null }, // Apenas pagamentos com CPF (tem cadastro)
      },
      include: {
        session: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Agrupar por CPF para criar perfil de jogador
    const playersMap = new Map();

    payments.forEach((payment) => {
      const cpf = payment.cpf!;
      
      if (!playersMap.has(cpf)) {
        playersMap.set(cpf, {
          cpf,
          name: payment.name || "Não informado",
          whatsapp: payment.whatsapp || "Não informado",
          totalGames: 0,
          totalWins: 0,
          totalSpent: 0,
          firstGame: payment.createdAt,
          lastGame: payment.createdAt,
          games: [],
        });
      }

      const player = playersMap.get(cpf);
      player.totalGames += 1;
      player.totalSpent += payment.amount;
      
      if (payment.session?.isWinner) {
        player.totalWins += 1;
      }

      if (payment.createdAt < player.firstGame) {
        player.firstGame = payment.createdAt;
      }
      if (payment.createdAt > player.lastGame) {
        player.lastGame = payment.createdAt;
      }

      player.games.push({
        id: payment.id,
        date: payment.createdAt,
        amount: payment.amount,
        status: payment.status,
        isWinner: payment.session?.isWinner || false,
        attempts: payment.attempts,
      });
    });

    const players = Array.from(playersMap.values());

    return NextResponse.json({ players });
  } catch (error: any) {
    console.error("Erro ao buscar jogadores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar jogadores", details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_REVEALS = 3;

export async function POST(req: NextRequest) {
  const { sessionId, cardIndex } = await req.json();

  if (typeof cardIndex !== "number" || cardIndex < 0 || cardIndex > 9) {
    return NextResponse.json({ error: "Índice inválido" }, { status: 400 });
  }

  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  const results = JSON.parse(session.results) as boolean[];
  const revealed = JSON.parse(session.revealed) as number[];

  if (revealed.length >= MAX_REVEALS) {
    return NextResponse.json(
      { error: "Máximo de revelações atingido" },
      { status: 400 }
    );
  }

  if (revealed.includes(cardIndex)) {
    return NextResponse.json(
      { error: "Cartela já revelada" },
      { status: 400 }
    );
  }

  const result = results[cardIndex];
  const newRevealed = [...revealed, cardIndex];
  const isWinnerCard = result === true;
  const isDone = newRevealed.length >= MAX_REVEALS || isWinnerCard;
  const isWinnerSession = isWinnerCard || session.isWinner;

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      revealed: JSON.stringify(newRevealed),
      isWinner: isWinnerSession,
    },
  });

  if (isWinnerCard) {
    await prisma.auditLog.create({
      data: {
        event: "PRIZE_WON",
        data: JSON.stringify({ sessionId, cardIndex }),
      },
    });
  }

  return NextResponse.json({
    result,
    revealed: newRevealed,
    isDone,
    isWinner: isWinnerSession,
  });
}

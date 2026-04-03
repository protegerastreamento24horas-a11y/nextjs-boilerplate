import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const MAX_REVEALS = 3;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const session = await prisma.gameSession.findUnique({ where: { id } });

  if (!session) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  const revealed = JSON.parse(session.revealed) as number[];
  const results = JSON.parse(session.results) as boolean[];

  return NextResponse.json({
    sessionId: session.id,
    revealed,
    results, // <- adicionado para mostrar onde estavam os prêmios no final
    maxReveals: MAX_REVEALS,
    isDone: revealed.length >= MAX_REVEALS,
    isWinner: session.isWinner,
  });
}

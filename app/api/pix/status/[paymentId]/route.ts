import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { session: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    status: payment.status,
    sessionId: payment.session?.id ?? null,
  });
}

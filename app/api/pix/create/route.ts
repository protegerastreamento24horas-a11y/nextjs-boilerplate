import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { quantity, amount } = await req.json();

  const payment = await prisma.payment.create({
    data: {
      amount: Number(amount),
      attempts: Number(quantity) || 1,
      status: "pending",
      pixId: crypto.randomUUID(),
    },
  });

  return NextResponse.json({
    paymentId: payment.id,
    pixId: payment.pixId,
    amount: payment.amount,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const config = await prisma.config.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();

  // Sanitize inputs
  const data = {
    precoTentativa: Number(body.precoTentativa),
    custoPremio: Number(body.custoPremio),
    lucroMinimo: Number(body.lucroMinimo),
    probabilidade: Math.min(1, Math.max(0, Number(body.probabilidade))),
    modoManual: Boolean(body.modoManual),
    forcarPremio: Boolean(body.forcarPremio),
  };

  const config = await prisma.config.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return NextResponse.json(config);
}

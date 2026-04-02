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
  console.log("[API Config] Recebido:", body);

  // Sanitize inputs com valores padrão
  const data = {
    precoTentativa: Number(body.precoTentativa ?? 2.5),
    custoPremio: Number(body.custoPremio ?? 50),
    lucroMinimo: Number(body.lucroMinimo ?? 20),
    probabilidade: Math.min(1, Math.max(0, Number(body.probabilidade ?? 0.1))),
    modoManual: Boolean(body.modoManual ?? false),
    forcarPremio: Boolean(body.forcarPremio ?? false),
    modoDemo: Boolean(body.modoDemo ?? true),
  };

  console.log("[API Config] Salvando:", data);

  const config = await prisma.config.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return NextResponse.json(config);
}

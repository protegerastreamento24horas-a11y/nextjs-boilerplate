import { NextResponse } from "next/server";
import { createBackup, formatBackupSize, getDatabaseStats, exportBackupToJson } from "@/lib/backup";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const result = await createBackup(ip);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    backup: result.data,
    size: result.size,
    formattedSize: formatBackupSize(result.size || 0),
  });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const download = searchParams.get("download") === "true";

  if (download) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const result = await createBackup(ip);

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const json = exportBackupToJson(result.data);
    
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup_${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  }

  // Retorna estatísticas do banco
  const stats = await getDatabaseStats();
  return NextResponse.json({ stats });
}

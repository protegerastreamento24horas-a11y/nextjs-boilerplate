import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WEBP" },
        { status: 400 }
      );
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 5MB" },
        { status: 400 }
      );
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), "public", folder);
    await mkdir(uploadDir, { recursive: true });

    // Gerar nome único
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const fileName = `${timestamp}-${originalName}`;
    const filePath = join(uploadDir, fileName);

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL pública
    const publicUrl = `/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}

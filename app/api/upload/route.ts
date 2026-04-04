import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Upload de imagens para banners - suporta GIF, JPG, PNG, WebP
export async function POST(request: NextRequest) {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

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

    // Validar tamanho (max 10MB para Imgur)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 10MB" },
        { status: 400 }
      );
    }

    // Converter para base64 para enviar ao Imgur
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Enviar para Imgur (anônimo, client ID pública)
    const IMGUR_CLIENT_ID = "546c25a59c58ad7"; // Client ID pública para demos
    
    const imgurResponse = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64,
        type: "base64",
      }),
    });

    if (!imgurResponse.ok) {
      const errorData = await imgurResponse.json();
      console.error("Erro Imgur:", errorData);
      return NextResponse.json(
        { error: "Erro ao fazer upload para Imgur" },
        { status: 500 }
      );
    }

    const imgurData = await imgurResponse.json();
    const imageUrl = imgurData.data.link;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao processar imagem" },
      { status: 500 }
    );
  }
}

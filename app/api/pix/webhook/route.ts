import { NextRequest, NextResponse } from "next/server";

// Webhook do Mercado Pago - versão mínima para teste
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log("Webhook POST recebido - method:", req.method);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));
  
  try {
    const body = await req.json();
    console.log("Body:", body);
    
    return NextResponse.json({ 
      received: true, 
      message: "Webhook funcionando!",
      method: req.method
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ 
      received: true, 
      error: "Erro ao processar",
      method: req.method
    }, { status: 200 });
  }
}

export async function OPTIONS(req: NextRequest) {
  console.log("Webhook OPTIONS recebido");
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

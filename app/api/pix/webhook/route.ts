import { NextRequest, NextResponse } from "next/server";

// Webhook do Mercado Pago - versão mínima para teste
export async function POST(req: NextRequest) {
  console.log("Webhook POST recebido");
  
  try {
    const body = await req.json();
    console.log("Body:", body);
    
    return NextResponse.json({ 
      received: true, 
      message: "Webhook funcionando!" 
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ 
      received: true, 
      error: "Erro ao processar" 
    }, { status: 200 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

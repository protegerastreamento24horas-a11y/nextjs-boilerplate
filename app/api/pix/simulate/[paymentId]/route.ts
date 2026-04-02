import { NextRequest, NextResponse } from "next/server";

// ROTA DEPRECADA - Modo demo foi removido do sistema
// Endpoint mantido para compatibilidade, mas retorna erro
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  
  return NextResponse.json(
    { 
      error: "Modo demo removido", 
      message: "O sistema agora opera apenas em modo real via Asaas. Esta rota foi descontinuada.",
      paymentId
    },
    { status: 410 } // Gone
  );
}

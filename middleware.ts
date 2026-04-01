import { NextResponse } from "next/server";

export default async function middleware() {
  // Apenas permite todas as requisições
  // Autenticação é tratada individualmente em cada rota
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

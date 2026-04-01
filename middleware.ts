import { NextResponse } from "next/server";

export default async function middleware() {
  // Permite todas as requisições passarem
  // O NextAuth protege as rotas individualmente
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

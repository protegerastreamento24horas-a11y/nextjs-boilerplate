import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Permitir webhook do Mercado Pago sem autenticação
  if (req.nextUrl.pathname.startsWith("/api/pix/webhook")) {
    return NextResponse.next();
  }
  
  // Permitir rotas públicas
  if (req.nextUrl.pathname === "/" || 
      req.nextUrl.pathname === "/game" ||
      req.nextUrl.pathname.startsWith("/api/pix/create") ||
      req.nextUrl.pathname.startsWith("/api/pix/status")) {
    return NextResponse.next();
  }
  
  // Verificar autenticação para rotas admin
  if (req.nextUrl.pathname.startsWith("/admin") && !req.auth) {
    const newUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

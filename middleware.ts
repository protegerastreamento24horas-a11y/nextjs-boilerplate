import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginPage = nextUrl.pathname === "/admin/login";

  // Se está em rota admin, não está logado, e não é a página de login
  if (isAdminRoute && !isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  // Se está logado e tenta acessar login, redireciona para admin
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

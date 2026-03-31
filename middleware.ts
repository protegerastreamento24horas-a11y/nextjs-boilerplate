import { auth } from "@/auth";

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if (!req.auth && !isLoginPage) {
    return Response.redirect(new URL("/admin/login", req.nextUrl));
  }

  // Redireciona usuário logado para fora do login
  if (req.auth && isLoginPage) {
    return Response.redirect(new URL("/admin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

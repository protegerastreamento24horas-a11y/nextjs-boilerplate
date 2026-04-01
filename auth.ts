import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", email, name: "Admin" };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
    async authorized({ request, auth }) {
      // Permitir webhook do Mercado Pago sem autenticação
      if (request.nextUrl.pathname.startsWith("/api/pix/webhook")) {
        return true;
      }
      // Permitir rotas públicas
      if (request.nextUrl.pathname === "/" || 
          request.nextUrl.pathname === "/game" ||
          request.nextUrl.pathname.startsWith("/api/pix/create")) {
        return true;
      }
      return !!auth;
    },
  },
});

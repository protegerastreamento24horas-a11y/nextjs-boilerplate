import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Se já está logado, redireciona para admin
  if (session) {
    redirect("/admin");
  }

  // Apenas renderiza a página de login (sem sidebar)
  return <>{children}</>;
}

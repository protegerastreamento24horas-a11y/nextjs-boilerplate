import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isLoginPage = pathname === "/admin/login";

  // Se não está logado e não é a página de login, redireciona
  if (!session && !isLoginPage) {
    redirect("/admin/login");
  }

  // Login page: no sidebar
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AdminSidebar adminEmail={session.user?.email ?? "Admin"} />
      <main className="flex-1 p-6 md:p-8 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}

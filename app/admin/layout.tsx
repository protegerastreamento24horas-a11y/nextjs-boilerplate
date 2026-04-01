import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Se não está logado, redireciona para login
  if (!session) {
    redirect("/admin/login");
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

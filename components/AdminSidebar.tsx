"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  adminEmail: string;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/config", label: "Configurações", icon: "⚙️" },
];

export default function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800">
        <div className="text-yellow-400 font-black text-base">🎲 Raspadinha</div>
        <div className="text-zinc-600 text-xs mt-0.5">Admin Panel</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <span>🌐</span>
          Ver Site
        </Link>
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-zinc-800">
        <div className="px-4 py-2 mb-1">
          <div className="text-zinc-300 text-xs font-medium truncate">
            {adminEmail}
          </div>
          <div className="text-zinc-600 text-[11px]">Administrador</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  );
}

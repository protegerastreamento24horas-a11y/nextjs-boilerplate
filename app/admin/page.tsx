"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdminStats } from "@/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10_000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (res.ok) {
        const data: AdminStats = await res.json();
        setStats(data);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-zinc-500 animate-pulse text-sm">
        Carregando dados...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-red-400 text-sm">Erro ao carregar estatísticas.</div>
    );
  }

  const statCards = [
    {
      label: "Total Arrecadado",
      value: formatBRL(stats.totalArrecadado),
      icon: "💰",
      color: "text-yellow-400",
      sub: `${stats.totalPagamentos} pagamentos`,
    },
    {
      label: "Total de Jogadas",
      value: String(stats.totalJogadas),
      icon: "🎮",
      color: "text-blue-400",
      sub: "sessões iniciadas",
    },
    {
      label: "Prêmios Pagos",
      value: String(stats.premiosPagos),
      icon: "🏆",
      color: "text-purple-400",
      sub: "ganhadores",
    },
    {
      label: "Lucro Atual",
      value: formatBRL(stats.lucroAtual),
      icon: stats.lucroAtual >= 0 ? "📈" : "📉",
      color: stats.lucroAtual >= 0 ? "text-emerald-400" : "text-red-400",
      sub: "arrecadado − prêmios",
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Visão geral em tempo real · Atualiza a cada 10s
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-7">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className={`text-2xl font-black ${card.color} mb-0.5 tabular-nums`}>
              {card.value}
            </div>
            <div className="text-zinc-400 text-xs font-medium">{card.label}</div>
            <div className="text-zinc-700 text-[11px] mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4">
          📋 Sessões Recentes
        </h2>

        {stats.recentSessions.length === 0 ? (
          <p className="text-zinc-600 text-sm">Nenhuma sessão ainda.</p>
        ) : (
          <div className="space-y-0">
            {stats.recentSessions.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between py-3 ${
                  i < stats.recentSessions.length - 1
                    ? "border-b border-zinc-800"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{s.isWinner ? "🏆" : "❌"}</span>
                  <div>
                    <span className="text-zinc-400 text-xs font-mono">
                      {s.id.slice(0, 8)}...
                    </span>
                    <div className="text-zinc-700 text-[11px]">
                      {formatDate(s.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-zinc-300 text-sm tabular-nums">
                    {formatBRL(s.amount)}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      s.isWinner
                        ? "text-emerald-400 bg-emerald-900/30"
                        : "text-zinc-600 bg-zinc-800"
                    }`}
                  >
                    {s.isWinner ? "GANHOU" : "perdeu"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

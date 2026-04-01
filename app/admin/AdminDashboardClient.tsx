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

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

// Simple SVG Bar Chart Component
function SalesChart({ data }: { data: Array<{ date: string; amount: number; count: number }> }) {
  if (data.length === 0) return null;

  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  const chartHeight = 150;
  const barWidth = Math.max(8, 300 / data.length);
  const gap = 4;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        <svg viewBox={`0 0 ${data.length * (barWidth + gap)} ${chartHeight + 30}`} className="w-full h-auto">
          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.amount / maxAmount) * chartHeight;
            const x = index * (barWidth + gap);
            const y = chartHeight - barHeight;

            return (
              <g key={item.date}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#gradient)"
                  rx={4}
                  className="hover:opacity-80 transition-opacity"
                />
                {/* Tooltip label */}
                <title>{`${formatDateShort(item.date)}: ${formatBRL(item.amount)} (${item.count} vendas)`}</title>
              </g>
            );
          })}

          {/* X-axis labels (show every 5th label) */}
          {data.map((item, index) => {
            if (index % 5 !== 0) return null;
            const x = index * (barWidth + gap) + barWidth / 2;
            return (
              <text
                key={`label-${item.date}`}
                x={x}
                y={chartHeight + 20}
                textAnchor="middle"
                fill="#71717a"
                fontSize="10"
              >
                {formatDateShort(item.date)}
              </text>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    expired: "bg-red-500/20 text-red-400 border-red-500/30",
    cancelled: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  const labels = {
    paid: "Pago",
    pending: "Pendente",
    expired: "Expirado",
    cancelled: "Cancelado",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "sessions" | "logs" | "backup">("overview");
  const [logs, setLogs] = useState<Array<{ id: string; event: string; data: unknown; ip: string | null; createdAt: string }>>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [backupStats, setBackupStats] = useState<{ total: { payments: number; sessions: number; configs: number; auditLogs: number; transactions: number }; paid: number; pending: number } | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "backup") {
      fetchBackupStats();
    }
  }, [activeTab]);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        setUnauthorized(true);
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

  async function fetchLogs() {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/logs?limit=50");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } finally {
      setLogsLoading(false);
    }
  }

  async function fetchBackupStats() {
    setBackupLoading(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (res.ok) {
        const data = await res.json();
        setBackupStats(data.stats);
      }
    } finally {
      setBackupLoading(false);
    }
  }

  async function downloadBackup() {
    try {
      const res = await fetch("/api/admin/backup?download=true");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
    }
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Acesso não autorizado</p>
          <button
            onClick={() => router.push("/admin/login")}
            className="px-4 py-2 bg-yellow-500 text-black rounded font-bold"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse text-sm">
          Carregando dados...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-sm">Erro ao carregar estatísticas.</div>
      </div>
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
      label: "Receita Hoje",
      value: formatBRL(stats.topStats.todayRevenue),
      icon: "📅",
      color: "text-emerald-400",
      sub: "hoje",
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
      label: "Ticket Médio",
      value: formatBRL(stats.topStats.avgTicket),
      icon: "🎫",
      color: "text-cyan-400",
      sub: "por pagamento",
    },
    {
      label: "Taxa de Conversão",
      value: `${stats.topStats.conversionRate.toFixed(1)}%`,
      icon: "📊",
      color: "text-orange-400",
      sub: "pagos / total",
    },
    {
      label: "Taxa de Vitória",
      value: `${stats.topStats.winRate.toFixed(1)}%`,
      icon: "🎯",
      color: "text-pink-400",
      sub: "ganhadores / jogos",
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Painel Administrativo</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Visão geral em tempo real · Atualiza a cada 10s
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "overview", label: "📊 Visão Geral" },
          { id: "payments", label: "💳 Pagamentos" },
          { id: "sessions", label: "🎮 Jogos" },
          { id: "logs", label: "📋 Logs" },
          { id: "backup", label: "💾 Backup" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-yellow-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
              >
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className={`text-xl md:text-2xl font-black ${card.color} mb-0.5 tabular-nums`}>
                  {card.value}
                </div>
                <div className="text-zinc-400 text-xs font-medium">{card.label}</div>
                <div className="text-zinc-700 text-[11px] mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Sales Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                📈 Vendas dos Últimos 30 Dias
              </h2>
              <SalesChart data={stats.salesData} />
              <div className="flex justify-between mt-4 text-xs text-zinc-500">
                <span>Total: {formatBRL(stats.salesData.reduce((acc, d) => acc + d.amount, 0))}</span>
                <span>{stats.salesData.reduce((acc, d) => acc + d.count, 0)} vendas</span>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                🎯 Distribuição de Status
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Pagos", count: stats.paymentsByStatus.paid, color: "bg-emerald-500", textColor: "text-emerald-400" },
                  { label: "Pendentes", count: stats.paymentsByStatus.pending, color: "bg-yellow-500", textColor: "text-yellow-400" },
                  { label: "Expirados", count: stats.paymentsByStatus.expired, color: "bg-red-500", textColor: "text-red-400" },
                ].map((item) => {
                  const total = stats.paymentsByStatus.paid + stats.paymentsByStatus.pending + stats.paymentsByStatus.expired;
                  const percentage = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                        <span className="text-zinc-400">{item.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              🔔 Atividade Recente
            </h2>
            <div className="space-y-2">
              {stats.recentPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {payment.status === "paid" ? "✅" : payment.status === "pending" ? "⏳" : "❌"}
                    </span>
                    <div>
                      <div className="text-zinc-300 text-sm font-mono">
                        {payment.id.slice(0, 8)}...
                      </div>
                      <div className="text-zinc-600 text-xs">
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-300 text-sm tabular-nums">
                      {formatBRL(payment.amount)}
                    </span>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "payments" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            💳 Todos os Pagamentos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Valor</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tentativas</th>
                  <th className="pb-3 font-medium">Resultado</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-zinc-800/50 last:border-0">
                    <td className="py-3 font-mono text-zinc-400">{payment.id.slice(0, 12)}...</td>
                    <td className="py-3 text-zinc-300 tabular-nums">{formatBRL(payment.amount)}</td>
                    <td className="py-3"><StatusBadge status={payment.status} /></td>
                    <td className="py-3 text-zinc-400">{payment.attempts}</td>
                    <td className="py-3">
                      {payment.session ? (
                        <span className={payment.session.isWinner ? "text-emerald-400" : "text-zinc-500"}>
                          {payment.session.isWinner ? "🏆 Ganhou" : "❌ Perdeu"}
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="py-3 text-zinc-500 text-xs">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            🎮 Sessões de Jogo
          </h2>
          <div className="space-y-3">
            {stats.recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{session.isWinner ? "🏆" : "❌"}</span>
                  <div>
                    <div className="text-zinc-400 text-xs font-mono">{session.id.slice(0, 8)}...</div>
                    <div className="text-zinc-600 text-xs">{formatDate(session.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-zinc-300 text-sm tabular-nums">
                    {formatBRL(session.amount)}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      session.isWinner
                        ? "text-emerald-400 bg-emerald-900/30 border border-emerald-500/30"
                        : "text-zinc-600 bg-zinc-800 border border-zinc-700"
                    }`}
                  >
                    {session.isWinner ? "🎉 GANHADOR" : "Não ganhou"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            📋 Logs de Auditoria
          </h2>
          {logsLoading ? (
            <div className="text-zinc-500 animate-pulse">Carregando logs...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0 text-sm">
                  <span className="text-zinc-500 text-xs">{formatDate(log.createdAt)}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs">{log.event}</span>
                  <span className="text-zinc-400 font-mono text-xs">{log.ip || "-"}</span>
                  {log.data && (
                    <span className="text-zinc-500 text-xs truncate max-w-xs">
                      {JSON.stringify(log.data).slice(0, 50)}...
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "backup" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            💾 Backup do Banco de Dados
          </h2>
          {backupLoading ? (
            <div className="text-zinc-500 animate-pulse">Carregando estatísticas...</div>
          ) : backupStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-400">{backupStats.total.payments}</div>
                  <div className="text-zinc-500 text-sm">Pagamentos</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-400">{backupStats.total.sessions}</div>
                  <div className="text-zinc-500 text-sm">Sessões</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-400">{backupStats.total.auditLogs}</div>
                  <div className="text-zinc-500 text-sm">Logs</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-emerald-400">{backupStats.paid}</div>
                  <div className="text-zinc-500 text-sm">Pagos</div>
                </div>
              </div>
              <button
                onClick={downloadBackup}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                📥 Baixar Backup Completo (JSON)
              </button>
            </div>
          ) : (
            <div className="text-red-400">Erro ao carregar estatísticas</div>
          )}
        </div>
      )}
    </div>
  );
}

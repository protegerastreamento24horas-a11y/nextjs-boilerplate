"use client";

import { useState, useEffect } from "react";

interface AffiliateStats {
  overview: {
    totalAffiliates: number;
    activeAffiliates: number;
    pendingAffiliates: number;
    blockedAffiliates: number;
    totalSales: number;
    totalCommissions: number;
    pendingCommissions: number;
    totalPaid: number;
    pendingWithdrawals: number;
  };
  topAffiliates: Array<{
    id: string;
    name: string;
    code: string;
    totalEarnings: number;
    totalSales: number;
  }>;
}

// Card de estatística moderno
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient = "from-zinc-800 to-zinc-900",
  accentColor = "text-white"
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: string;
  gradient?: string;
  accentColor?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/20 group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-white/10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className={`text-3xl font-black ${accentColor} mb-1`}>{value}</div>
        <div className="text-zinc-400 text-sm font-medium">{title}</div>
        {subtitle && <div className="text-zinc-500 text-xs mt-2">{subtitle}</div>}
      </div>
    </div>
  );
}

export default function AffiliatesAdminPage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "affiliates" | "withdrawals">("dashboard");

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/affiliates/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-yellow-400/50 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
            <p className="text-zinc-500 animate-pulse">Carregando painel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Moderno */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
              🎯
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 bg-clip-text text-transparent">
                Painel de Afiliados
              </h1>
              <p className="text-zinc-500 text-sm">
                Gerencie afiliados, comissões e saques em tempo real
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Modernas */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/5 w-fit">
          {[
            { id: "dashboard", label: "📊 Dashboard", desc: "Visão geral" },
            { id: "affiliates", label: "👥 Afiliados", desc: "Gerenciamento" },
            { id: "withdrawals", label: "💸 Saques", desc: "Pagamentos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/25"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && stats && (
          <>
            {/* Stats Cards Modernos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard 
                title="Total de Afiliados" 
                value={stats.overview.totalAffiliates}
                subtitle={`${stats.overview.activeAffiliates} ativos · ${stats.overview.pendingAffiliates} pendentes`}
                icon="👥"
                gradient="from-blue-600/20 to-blue-800/20"
                accentColor="text-blue-400"
              />
              <StatCard 
                title="Total em Comissões" 
                value={formatCurrency(stats.overview.totalCommissions)}
                subtitle={`${formatCurrency(stats.overview.pendingCommissions)} pendentes`}
                icon="💰"
                gradient="from-emerald-600/20 to-emerald-800/20"
                accentColor="text-emerald-400"
              />
              <StatCard 
                title="Total Pago em Saques" 
                value={formatCurrency(stats.overview.totalPaid)}
                subtitle={`${stats.overview.pendingWithdrawals} saques pendentes`}
                icon="💸"
                gradient="from-purple-600/20 to-purple-800/20"
                accentColor="text-purple-400"
              />
              <StatCard 
                title="Vendas via Afiliados" 
                value={stats.overview.totalSales}
                subtitle="conversões confirmadas"
                icon="🛒"
                gradient="from-orange-600/20 to-orange-800/20"
                accentColor="text-orange-400"
              />
            </div>

            {/* Top Affiliates Moderno */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">
                    🏆 Top Afiliados
                  </h2>
                  <p className="text-zinc-500 text-sm">Melhores performance do mês</p>
                </div>
                <div className="px-4 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <span className="text-yellow-400 font-semibold text-sm">{stats.topAffiliates.length} afiliados</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-white/10">
                      <th className="pb-4 text-zinc-500 text-sm font-semibold uppercase tracking-wider">Posição</th>
                      <th className="pb-4 text-zinc-500 text-sm font-semibold uppercase tracking-wider">Afiliado</th>
                      <th className="pb-4 text-zinc-500 text-sm font-semibold uppercase tracking-wider">Código</th>
                      <th className="pb-4 text-zinc-500 text-sm font-semibold uppercase tracking-wider text-right">Vendas</th>
                      <th className="pb-4 text-zinc-500 text-sm font-semibold uppercase tracking-wider text-right">Ganhos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.topAffiliates.map((affiliate, index) => (
                      <tr key={affiliate.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-5">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg font-black ${
                            index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30" :
                            index === 1 ? "bg-gradient-to-br from-zinc-300 to-zinc-500 text-black" :
                            index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                            "bg-zinc-800 text-zinc-500"
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-lg">
                              {affiliate.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-white group-hover:text-yellow-400 transition-colors">{affiliate.name}</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className="px-3 py-1.5 bg-zinc-800 rounded-lg text-zinc-400 font-mono text-sm font-medium">
                            {affiliate.code}
                          </span>
                        </td>
                        <td className="py-5 text-right">
                          <span className="text-white font-bold text-lg">{affiliate.totalSales}</span>
                        </td>
                        <td className="py-5 text-right">
                          <span className="text-emerald-400 font-black text-lg">{formatCurrency(affiliate.totalEarnings)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Placeholder tabs modernizados */}
        {activeTab === "affiliates" && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-white mb-2">Gerenciamento de Afiliados</h3>
            <p className="text-zinc-500">Em desenvolvimento - Em breve novos recursos</p>
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-2xl font-bold text-white mb-2">Gerenciamento de Saques</h3>
            <p className="text-zinc-500">Em desenvolvimento - Em breve novos recursos</p>
          </div>
        )}
      </div>
    </div>
  );
}

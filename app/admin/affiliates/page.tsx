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
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            Painel de Afiliados
          </h1>
          <p className="text-zinc-400">
            Gerencie afiliados, comissões e saques
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("affiliates")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "affiliates"
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Afiliados
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "withdrawals"
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Saques
          </button>
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="text-zinc-400 text-sm mb-1">Total de Afiliados</div>
                <div className="text-3xl font-bold text-white">
                  {stats.overview.totalAffiliates}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-emerald-400">{stats.overview.activeAffiliates} ativos</span>
                  <span className="text-yellow-400">{stats.overview.pendingAffiliates} pendentes</span>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="text-zinc-400 text-sm mb-1">Total em Comissões</div>
                <div className="text-3xl font-bold text-emerald-400">
                  {formatCurrency(stats.overview.totalCommissions)}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  {formatCurrency(stats.overview.pendingCommissions)} pendentes
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="text-zinc-400 text-sm mb-1">Total Pago em Saques</div>
                <div className="text-3xl font-bold text-blue-400">
                  {formatCurrency(stats.overview.totalPaid)}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  {stats.overview.pendingWithdrawals} saques pendentes
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="text-zinc-400 text-sm mb-1">Vendas via Afiliados</div>
                <div className="text-3xl font-bold text-white">
                  {stats.overview.totalSales}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  conversões confirmadas
                </div>
              </div>
            </div>

            {/* Top Affiliates */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Top Afiliados
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-zinc-400 text-sm border-b border-zinc-800">
                      <th className="pb-3">Posição</th>
                      <th className="pb-3">Afiliado</th>
                      <th className="pb-3">Código</th>
                      <th className="pb-3 text-right">Vendas</th>
                      <th className="pb-3 text-right">Ganhos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topAffiliates.map((affiliate, index) => (
                      <tr key={affiliate.id} className="border-b border-zinc-800/50">
                        <td className="py-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                            index === 1 ? "bg-zinc-500/20 text-zinc-400" :
                            index === 2 ? "bg-amber-600/20 text-amber-500" :
                            "text-zinc-500"
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-white">{affiliate.name}</td>
                        <td className="py-3 text-zinc-400">{affiliate.code}</td>
                        <td className="py-3 text-right text-white">{affiliate.totalSales}</td>
                        <td className="py-3 text-right text-emerald-400">
                          {formatCurrency(affiliate.totalEarnings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === "affiliates" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400">Gerenciamento de afiliados - Em desenvolvimento</p>
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400">Gerenciamento de saques - Em desenvolvimento</p>
          </div>
        )}
      </div>
    </div>
  );
}

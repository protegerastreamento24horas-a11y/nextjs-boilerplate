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

// Modern Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient = "from-zinc-800 to-zinc-900",
  accentColor = "text-white"
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  icon: string;
  gradient?: string;
  accentColor?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/20 group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-white/10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className={`text-xl md:text-2xl font-black ${accentColor} mb-1 tabular-nums`}>{value}</div>
        <div className="text-zinc-400 text-sm font-medium">{title}</div>
        {subtitle && <div className="text-zinc-500 text-xs mt-1">{subtitle}</div>}
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "sessions" | "logs" | "backup" | "players" | "config">("overview");
  const [logs, setLogs] = useState<Array<{ id: string; event: string; data: unknown; ip: string | null; createdAt: string }>>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [backupStats, setBackupStats] = useState<{ total: { payments: number; sessions: number; configs: number; auditLogs: number; transactions: number }; paid: number; pending: number } | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [players, setPlayers] = useState<Array<{
    cpf: string;
    name: string;
    whatsapp: string;
    totalGames: number;
    totalWins: number;
    totalSpent: number;
    firstGame: string;
    lastGame: string;
    games: Array<{
      id: string;
      date: string;
      amount: number;
      status: string;
      isWinner: boolean;
      attempts: number;
    }>;
  }>>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  // Config states
  const [config, setConfig] = useState({
    precoTentativa: 2.50,
    probabilidade: 0.10,
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  
  // Banner/Popup modal states
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [siteConfig, setSiteConfig] = useState({
    mainBannerUrl: "",
    mainBannerUrl2: "",
    mainBannerUrl3: "",
    mainBannerUrl4: "",
    mainBannerUrl5: "",
    mainBannerLink: "",
    mainBannerActive: true,
    popupImageUrl: "",
    popupLink: "",
    popupActive: false,
    popupDelay: 3,
  });
  const [siteConfigLoading, setSiteConfigLoading] = useState(false);
  const [siteConfigSaving, setSiteConfigSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState<number | null>(null);
  const [uploadingPopup, setUploadingPopup] = useState(false);
  
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
    } else if (activeTab === "players") {
      fetchPlayers();
    } else if (activeTab === "config") {
      fetchConfig();
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

  async function fetchPlayers() {
    setPlayersLoading(true);
    try {
      const res = await fetch("/api/admin/players");
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
      }
    } finally {
      setPlayersLoading(false);
    }
  }

  async function fetchConfig() {
    setConfigLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        console.log("[Config] Carregado:", data);
        setConfig({
          precoTentativa: data.precoTentativa ?? 2.50,
          probabilidade: data.probabilidade ?? 0.10,
        });
      } else {
        console.error("[Config] Erro ao carregar:", res.status);
      }
    } finally {
      setConfigLoading(false);
    }
  }

  async function saveConfig() {
    setConfigSaving(true);
    console.log("[Config] Enviando:", config);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      console.log("[Config] Resposta:", data);
      if (res.ok) {
        alert("✅ Configuração salva com sucesso!");
      } else {
        alert("❌ Erro: " + (data.error || "Falha ao salvar"));
      }
    } catch (err: any) {
      alert("❌ Erro de conexão: " + err.message);
    } finally {
      setConfigSaving(false);
    }
  }

  // Site Config (Banners/Popup) functions
  async function fetchSiteConfig() {
    setSiteConfigLoading(true);
    try {
      const res = await fetch("/api/admin/site-config");
      if (res.ok) {
        const data = await res.json();
        setSiteConfig({
          mainBannerUrl: data.mainBannerUrl || "",
          mainBannerUrl2: data.mainBannerUrl2 || "",
          mainBannerUrl3: data.mainBannerUrl3 || "",
          mainBannerUrl4: data.mainBannerUrl4 || "",
          mainBannerUrl5: data.mainBannerUrl5 || "",
          mainBannerLink: data.mainBannerLink || "",
          mainBannerActive: data.mainBannerActive ?? true,
          popupImageUrl: data.popupImageUrl || "",
          popupLink: data.popupLink || "",
          popupActive: data.popupActive ?? false,
          popupDelay: data.popupDelay ?? 3,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar site config:", error);
    } finally {
      setSiteConfigLoading(false);
    }
  }

  async function saveSiteConfig() {
    setSiteConfigSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteConfig),
      });
      if (res.ok) {
        alert("✅ Banners/Popup salvos com sucesso!");
        setShowBannerModal(false);
      } else {
        const err = await res.json();
        alert("❌ Erro: " + (err.error || "Falha ao salvar"));
      }
    } catch (err: any) {
      alert("❌ Erro de conexão: " + err.message);
    } finally {
      setSiteConfigSaving(false);
    }
  }

  async function handleBannerUpload(file: File, bannerIndex: number) {
    if (!file) return;
    
    setUploadingBanner(bannerIndex);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "images");
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro no upload");
      }
      
      const data = await res.json();
      
      const fieldName = bannerIndex === 0 ? 'mainBannerUrl' : `mainBannerUrl${bannerIndex + 1}`;
      setSiteConfig(prev => ({ ...prev, [fieldName]: data.url }));
      
      alert(`✅ Imagem do banner ${bannerIndex + 1} enviada!`);
    } catch (error: any) {
      alert(`❌ Erro no upload: ${error.message}`);
    } finally {
      setUploadingBanner(null);
    }
  }

  // Load site config when modal opens
  useEffect(() => {
    if (showBannerModal) {
      fetchSiteConfig();
    }
  }, [showBannerModal]);

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
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-red-400 mb-4 text-lg">Acesso não autorizado</p>
          <button
            onClick={() => router.push("/admin/login")}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-yellow-400/50 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
          </div>
          <p className="text-zinc-500 animate-pulse">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-red-500/20">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-400 text-lg">Erro ao carregar estatísticas.</div>
        </div>
      </div>
    );
  }

  const statCardsData = [
    { label: "Total Arrecadado", value: formatBRL(stats.totalArrecadado), icon: "💰", gradient: "from-yellow-600/20 to-yellow-800/20", accentColor: "text-yellow-400", sub: `${stats.totalPagamentos} pagamentos` },
    { label: "Receita Hoje", value: formatBRL(stats.topStats.todayRevenue), icon: "📅", gradient: "from-emerald-600/20 to-emerald-800/20", accentColor: "text-emerald-400", sub: "hoje" },
    { label: "Total de Jogadas", value: String(stats.totalJogadas), icon: "🎮", gradient: "from-blue-600/20 to-blue-800/20", accentColor: "text-blue-400", sub: "sessões iniciadas" },
    { label: "Prêmios Pagos", value: String(stats.premiosPagos), icon: "🏆", gradient: "from-purple-600/20 to-purple-800/20", accentColor: "text-purple-400", sub: "ganhadores" },
    { label: "Ticket Médio", value: formatBRL(stats.topStats.avgTicket), icon: "🎫", gradient: "from-cyan-600/20 to-cyan-800/20", accentColor: "text-cyan-400", sub: "por pagamento" },
    { label: "Taxa de Conversão", value: `${stats.topStats.conversionRate.toFixed(1)}%`, icon: "📊", gradient: "from-orange-600/20 to-orange-800/20", accentColor: "text-orange-400", sub: "pagos / total" },
    { label: "Taxa de Vitória", value: `${stats.topStats.winRate.toFixed(1)}%`, icon: "🎯", gradient: "from-pink-600/20 to-pink-800/20", accentColor: "text-pink-400", sub: "ganhadores / jogos" },
    { label: "Lucro Atual", value: formatBRL(stats.lucroAtual), icon: stats.lucroAtual >= 0 ? "📈" : "📉", gradient: stats.lucroAtual >= 0 ? "from-emerald-600/20 to-emerald-800/20" : "from-red-600/20 to-red-800/20", accentColor: stats.lucroAtual >= 0 ? "text-emerald-400" : "text-red-400", sub: "arrecadado − prêmios" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Moderno */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
              🎰
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 bg-clip-text text-transparent">
                Painel Administrativo
              </h1>
              <p className="text-zinc-500 text-sm">
                Visão geral em tempo real · Atualiza a cada 10s
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Modernas */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/5 w-fit">
          {[
            { id: "overview", label: "📊 Visão Geral" },
            { id: "payments", label: "💳 Pagamentos" },
            { id: "sessions", label: "🎮 Jogos" },
            { id: "players", label: "👥 Jogadores" },
            { id: "logs", label: "📋 Logs" },
            { id: "backup", label: "💾 Backup" },
            { id: "config", label: "⚙️ Config" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/25"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* Link para Afiliados */}
          <a
            href="/admin/affiliates"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
          >
            🎯 Afiliados
          </a>
          {/* Link para Sorteios */}
          <a
            href="/admin/raffles"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
          >
            🎰 Sorteios
          </a>
          {/* Link para Banners */}
          <button
            onClick={() => setShowBannerModal(true)}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
          >
            🖼️ Banners
          </button>
        </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Grid Moderno */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCardsData.map((card) => (
              <StatCard
                key={card.label}
                title={card.label}
                value={card.value}
                subtitle={card.sub}
                icon={card.icon}
                gradient={card.gradient}
                accentColor={card.accentColor}
              />
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

      {activeTab === "players" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            👥 Jogadores Cadastrados
          </h2>
          {playersLoading ? (
            <div className="text-zinc-500 animate-pulse">Carregando jogadores...</div>
          ) : players.length === 0 ? (
            <div className="text-zinc-500">Nenhum jogador cadastrado ainda.</div>
          ) : (
            <div className="space-y-4">
              {players.map((player) => (
                <div key={player.cpf} className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-bold">{player.name}</div>
                      <div className="text-zinc-400 text-sm">CPF: {player.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</div>
                      <div className="text-emerald-400 text-sm">📱 {player.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{player.totalGames} jogos</div>
                      <div className="text-emerald-400 text-sm">{player.totalWins} vitórias</div>
                      <div className="text-zinc-500 text-xs">Total: {formatBRL(player.totalSpent)}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPlayer(selectedPlayer === player.cpf ? null : player.cpf)}
                    className="text-yellow-500 text-sm hover:text-yellow-400 transition-colors"
                  >
                    {selectedPlayer === player.cpf ? "▲ Ocultar histórico" : "▼ Ver histórico de jogos"}
                  </button>
                  
                  {selectedPlayer === player.cpf && (
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <div className="space-y-2">
                        {player.games.map((game) => (
                          <div key={game.id} className="flex items-center justify-between text-sm bg-zinc-900 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <span>{game.isWinner ? "🏆" : "❌"}</span>
                              <span className="text-zinc-400">{formatDate(game.date)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-zinc-300">{formatBRL(game.amount)}</span>
                              <span className={game.isWinner ? "text-emerald-400" : "text-zinc-500"}>
                                {game.isWinner ? "Ganhou" : "Perdeu"}
                              </span>
                              <StatusBadge status={game.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                  {log.data !== null && log.data !== undefined && (
                    <span className="text-zinc-500 text-xs truncate max-w-xs">
                      {(() => {
                        try {
                          const str = typeof log.data === "object" 
                            ? JSON.stringify(log.data).slice(0, 50) 
                            : String(log.data).slice(0, 50);
                          return str + "...";
                        } catch {
                          return "...";
                        }
                      })()}
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

      {activeTab === "config" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">
            ⚙️ Configurações do Sistema
          </h2>
          
          {configLoading ? (
            <div className="text-zinc-500 animate-pulse">Carregando configurações...</div>
          ) : (
            <div className="space-y-6">
              {/* Preço por Tentativa */}
              <div className="bg-zinc-800 rounded-xl p-5">
                <h3 className="text-white font-bold mb-3">💵 Preço por Tentativa</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0.50"
                    max="50"
                    value={config.precoTentativa}
                    onChange={(e) => setConfig({ ...config, precoTentativa: Number(e.target.value) })}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white w-32"
                  />
                  <span className="text-zinc-400">Reais</span>
                </div>
              </div>

              {/* Probabilidade */}
              <div className="bg-zinc-800 rounded-xl p-5">
                <h3 className="text-white font-bold mb-3">🎯 Probabilidade de Vitória</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1"
                    value={config.probabilidade}
                    onChange={(e) => setConfig({ ...config, probabilidade: Number(e.target.value) })}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white w-24"
                  />
                  <span className="text-zinc-400">({(config.probabilidade * 100).toFixed(0)}%)</span>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveConfig}
                disabled={configSaving}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {configSaving ? "💾 Salvando..." : "💾 Salvar Configurações"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Banners e Popup */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">🖼️ Gerenciar Banners</h2>
            
            {siteConfigLoading ? (
              <div className="text-zinc-500 animate-pulse">Carregando...</div>
            ) : (
              <div className="space-y-6">
                {/* Banners da Homepage - Até 5 imagens */}
                <div className="bg-zinc-800 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-4">🏠 Banners da Homepage (até 5)</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const fieldName = index === 0 ? 'mainBannerUrl' : `mainBannerUrl${index + 1}`;
                      const bannerUrl = siteConfig[fieldName as keyof typeof siteConfig] as string;
                      
                      return (
                        <div key={index} className="bg-zinc-900/50 rounded-lg p-3">
                          <label className="block text-sm text-zinc-400 mb-2">Banner {index + 1}</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={bannerUrl}
                              onChange={(e) => setSiteConfig({ ...siteConfig, [fieldName]: e.target.value })}
                              placeholder={`https://exemplo.com/banner${index + 1}.jpg`}
                              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                            />
                            <label className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap">
                              {uploadingBanner === index ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <span>📁</span>
                              )}
                              <span className="hidden sm:inline">Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], index)}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {bannerUrl && (
                            <img src={bannerUrl} alt={`Banner ${index + 1} preview`} className="mt-2 h-20 rounded-lg object-cover" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm text-zinc-400 mb-1">Link dos Banners (opcional)</label>
                    <input
                      type="text"
                      value={siteConfig.mainBannerLink}
                      onChange={(e) => setSiteConfig({ ...siteConfig, mainBannerLink: e.target.value })}
                      placeholder="https://exemplo.com/promocao"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={siteConfig.mainBannerActive}
                      onChange={(e) => setSiteConfig({ ...siteConfig, mainBannerActive: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-600"
                    />
                    <span className="text-zinc-300">Banners ativos</span>
                  </label>
                </div>

                {/* Popup */}
                <div className="bg-zinc-800 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-4">💬 Popup Promocional</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Imagem do Popup</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={siteConfig.popupImageUrl}
                          onChange={(e) => setSiteConfig({ ...siteConfig, popupImageUrl: e.target.value })}
                          placeholder="https://exemplo.com/popup.jpg"
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                        />
                        <label className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                          {uploadingPopup ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <span>📁</span>
                          )}
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], 'popup')}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {siteConfig.popupImageUrl && (
                        <img src={siteConfig.popupImageUrl} alt="Popup preview" className="mt-2 h-32 rounded-lg object-contain bg-zinc-900 px-4" />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Link do Popup (opcional)</label>
                      <input
                        type="text"
                        value={siteConfig.popupLink}
                        onChange={(e) => setSiteConfig({ ...siteConfig, popupLink: e.target.value })}
                        placeholder="https://exemplo.com/oferta"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteConfig.popupActive}
                          onChange={(e) => setSiteConfig({ ...siteConfig, popupActive: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-600"
                        />
                        <span className="text-zinc-300">Popup ativo</span>
                      </label>
                      
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Delay (segundos)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={siteConfig.popupDelay}
                          onChange={(e) => setSiteConfig({ ...siteConfig, popupDelay: parseInt(e.target.value) || 0 })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveSiteConfig}
                    disabled={siteConfigSaving}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {siteConfigSaving ? "💾 Salvando..." : "💾 Salvar Banners"}
                  </button>
                  <button
                    onClick={() => setShowBannerModal(false)}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  MousePointerClick, 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  Copy, 
  Share2, 
  LogOut,
  DollarSign,
  Award,
  Target,
  Users,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

// Componente principal que usa useSearchParams
function AffiliatePageContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams?.get("code") || "");
  const [view, setView] = useState<"register" | "dashboard">("register");
  const [loading, setLoading] = useState(false);
  const [affiliateData, setAffiliateData] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    pixKey: "",
    pixKeyType: "cpf",
  });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Cadastro realizado! Aguarde aprovação.");
        setCode(data.affiliate.code);
        setView("dashboard");
        fetchDashboard(data.affiliate.code);
      } else {
        alert(data.error || "Erro ao cadastrar");
      }
    } catch (error) {
      alert("Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDashboard(affiliateCode: string) {
    try {
      const res = await fetch(`/api/affiliate/dashboard?code=${affiliateCode}`);
      if (res.ok) {
        const data = await res.json();
        setAffiliateData(data);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetchDashboard(code);
    setView("dashboard");
    setLoading(false);
  }

  function shareWhatsApp() {
    if (affiliateData?.affiliateLink) {
      const text = encodeURIComponent(
        `🎮 Jogue e ganhe! Use meu link e participe: ${affiliateData.affiliateLink}`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            Programa de Afiliados
          </h1>
          <p className="text-zinc-400 text-lg">
            Ganhe comissão por cada venda realizada através da sua indicação
          </p>
        </div>

        {view === "register" ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Por que ser um afiliado?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">💰</span>
                  <div>
                    <strong className="text-white">10% de comissão</strong>
                    <p className="text-zinc-400 text-sm">
                      Ganhe 10% sobre cada venda realizada
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">🔗</span>
                  <div>
                    <strong className="text-white">Link exclusivo</strong>
                    <p className="text-zinc-400 text-sm">
                      Código único para rastrear suas vendas
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">⏱️</span>
                  <div>
                    <strong className="text-white">Cookie de 30 dias</strong>
                    <p className="text-zinc-400 text-sm">
                      Comissão mesmo que o cliente compre depois
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">💸</span>
                  <div>
                    <strong className="text-white">Saques via PIX</strong>
                    <p className="text-zinc-400 text-sm">
                      Receba direto na sua conta
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Login / Register Form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Área do Afiliado
              </h2>

              {/* Login with Code */}
              <form onSubmit={handleLogin} className="mb-8">
                <label className="block text-zinc-400 text-sm mb-2">
                  Já é afiliado? Digite seu código
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: MARIA123"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !code}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Entrar
                  </button>
                </div>
              </form>

              <div className="border-t border-zinc-800 pt-8">
                <h3 className="text-lg font-bold text-white mb-4">
                  Novo por aqui? Cadastre-se
                </h3>

                <form onSubmit={handleRegister} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />

                  <input
                    type="tel"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />

                  <input
                    type="text"
                    placeholder="CPF (apenas números)"
                    required
                    maxLength={11}
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, "") })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />

                  <input
                    type="text"
                    placeholder="Chave PIX"
                    required
                    value={formData.pixKey}
                    onChange={(e) =>
                      setFormData({ ...formData, pixKey: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? "Processando..." : "Quero ser Afiliado"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Profissional */
          affiliateData && (
            <div className="space-y-8">
              {/* Header com saudação */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Olá, {affiliateData.affiliate.name.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-zinc-400 mt-1">
                    Acompanhe seu desempenho e ganhos
                  </p>
                </div>
                <button
                  onClick={() => setView("register")}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>

              {/* Card do Link de Afiliado */}
              <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="w-5 h-5 text-yellow-400" />
                      <h2 className="text-xl font-bold text-white">Seu Link de Afiliado</h2>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">
                      Compartilhe este link nas suas redes sociais. Você ganha comissão a cada venda realizada!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 flex items-center">
                        <input
                          type="text"
                          readOnly
                          value={affiliateData.affiliateLink}
                          className="flex-1 bg-transparent text-white text-sm outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(affiliateData.affiliateLink);
                            alert("Link copiado!");
                          }}
                          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-3 rounded-xl transition-all"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </button>
                        <button
                          onClick={shareWhatsApp}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-3 rounded-xl transition-all"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/80 border border-zinc-800 hover:border-yellow-500/50 rounded-xl p-5 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                      <MousePointerClick className="w-5 h-5 text-yellow-400" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {affiliateData.affiliate.totalClicks}
                  </div>
                  <div className="text-zinc-400 text-sm">Total de Cliques</div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 hover:border-blue-500/50 rounded-xl p-5 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <ShoppingCart className="w-5 h-5 text-blue-400" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {affiliateData.affiliate.totalSales}
                  </div>
                  <div className="text-zinc-400 text-sm">Total de Vendas</div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">Disponível</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    {formatCurrency(affiliateData.affiliate.pendingBalance)}
                  </div>
                  <div className="text-zinc-400 text-sm">Saldo para Saque</div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 rounded-xl p-5 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      <DollarSign className="w-5 h-5 text-purple-400" />
                    </div>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {formatCurrency(affiliateData.affiliate.totalEarnings)}
                  </div>
                  <div className="text-zinc-400 text-sm">Total Ganho</div>
                </div>
              </div>

              {/* Taxa de Conversão */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {affiliateData.affiliate.totalClicks > 0 
                        ? ((affiliateData.affiliate.totalSales / affiliateData.affiliate.totalClicks) * 100).toFixed(1)
                        : "0.0"}%
                    </div>
                    <div className="text-zinc-400 text-sm">Taxa de Conversão</div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-pink-500/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {affiliateData.affiliate.commissionRate}%
                    </div>
                    <div className="text-zinc-400 text-sm">Sua Comissão</div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {affiliateData.affiliate.code}
                    </div>
                    <div className="text-zinc-400 text-sm">Seu Código</div>
                  </div>
                </div>
              </div>

              {/* Saque Disponível */}
              {affiliateData.affiliate.pendingBalance >= 50 && (
                <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <AlertCircle className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-emerald-400">
                          Saque disponível!
                        </h3>
                        <p className="text-zinc-400">
                          Você tem {formatCurrency(affiliateData.affiliate.pendingBalance)} para sacar
                        </p>
                      </div>
                    </div>
                    <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl transition-all flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Solicitar Saque
                    </button>
                  </div>
                </div>
              )}

              {/* Comissões Recentes */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Comissões Recentes</h3>
                  </div>
                  <span className="text-sm text-zinc-500">
                    Últimas {affiliateData.recentCommissions?.length || 0} comissões
                  </span>
                </div>
                <div className="divide-y divide-zinc-800">
                  {affiliateData.recentCommissions?.length > 0 ? (
                    affiliateData.recentCommissions.map((commission: any) => (
                      <div
                        key={commission.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(commission.status)}
                          <div>
                            <div className="font-semibold text-white">
                              {formatCurrency(commission.commission)}
                            </div>
                            <div className="text-zinc-500 text-sm">
                              {commission.rate}% de {formatCurrency(commission.amount)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                            commission.status === "paid"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : commission.status === "approved"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {commission.status === "paid"
                            ? "Pago"
                            : commission.status === "approved"
                            ? "Aprovado"
                            : "Pendente"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <DollarSign className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500">Nenhuma comissão ainda</p>
                      <p className="text-zinc-600 text-sm mt-1">
                        Compartilhe seu link para começar a ganhar!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dicas */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Dica para aumentar suas vendas
                </h4>
                <p className="text-zinc-400 text-sm">
                  Compartilhe seu link em grupos de WhatsApp, Instagram Stories e TikTok. 
                  Quanto mais pessoas clicarem, maiores são suas chances de conversão!
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Export principal com Suspense boundary
export default function AffiliatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <AffiliatePageContent />
    </Suspense>
  );
}

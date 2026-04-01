"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

  function copyLink() {
    if (affiliateData?.affiliateLink) {
      navigator.clipboard.writeText(affiliateData.affiliateLink);
      alert("Link copiado!");
    }
  }

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
          /* Dashboard */
          affiliateData && (
            <div className="space-y-6">
              {/* Affiliate Link Card */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Seu Link de Afiliado
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Compartilhe este link para ganhar comissão
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={affiliateData.affiliateLink}
                    className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
                  />
                  <button
                    onClick={copyLink}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-xl transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="text-zinc-400 text-sm mb-1">Total de Cliques</div>
                  <div className="text-2xl font-bold text-white">
                    {affiliateData.affiliate.totalClicks}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="text-zinc-400 text-sm mb-1">Total de Vendas</div>
                  <div className="text-2xl font-bold text-white">
                    {affiliateData.affiliate.totalSales}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="text-zinc-400 text-sm mb-1">Saldo Disponível</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(affiliateData.affiliate.pendingBalance)}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="text-zinc-400 text-sm mb-1">Total Ganho</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(affiliateData.affiliate.totalEarnings)}
                  </div>
                </div>
              </div>

              {/* Request Withdrawal */}
              {affiliateData.affiliate.pendingBalance >= 50 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-emerald-400">
                        Saldo disponível para saque!
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        Você possui {formatCurrency(affiliateData.affiliate.pendingBalance)} disponível
                      </p>
                    </div>
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3 rounded-xl transition-colors">
                      Solicitar Saque
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Commissions */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Comissões Recentes
                </h3>
                {affiliateData.recentCommissions?.length > 0 ? (
                  <div className="space-y-2">
                    {affiliateData.recentCommissions.map((commission: any) => (
                      <div
                        key={commission.id}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                      >
                        <div>
                          <span className="text-white font-medium">
                            {formatCurrency(commission.commission)}
                          </span>
                          <span className="text-zinc-500 text-sm ml-2">
                            ({commission.rate}% de {formatCurrency(commission.amount)})
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
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
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">Nenhuma comissão ainda</p>
                )}
              </div>

              <button
                onClick={() => setView("register")}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ← Sair
              </button>
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

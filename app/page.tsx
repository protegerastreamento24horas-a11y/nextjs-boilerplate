"use client";
// Deploy Vercel v2

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PixModal from "@/components/PixModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import BannerCarousel from "@/components/BannerCarousel";
import { useToast } from "@/components/ToastContext";
import PlayerCounter from "@/components/PlayerCounter";
import FloatingBeers from "@/components/FloatingBeers";
import RecentWinnersTicker from "@/components/RecentWinnersTicker";

const PRICE_PER_ATTEMPT = 5; // R$ 5,00 (mínimo do Asaas)

// Pacotes com desconto
const PACKAGES = [
  { id: 1, quantity: 1, price: 5, label: "1 Tentativa", popular: false },
  { id: 2, quantity: 3, price: 12, label: "3 Tentativas", popular: true, save: 3 },
  { id: 3, quantity: 5, price: 20, label: "5 Tentativas", popular: false, save: 5 },
];

// Configuração das imagens do banner
const BANNER_IMAGES = [
  { src: "/images/banner1.jpg", alt: "Raspadinha da Sorte - A sorte está em suas mãos!" },
  { src: "/images/banner2.jpg", alt: "Raspadinha da Sorte - Concorra a prêmios incríveis!" },
  { src: "/images/banner3.jpg", alt: "Raspadinha da Sorte - Heineken, Stella Artois e Corona!" },
];

const recentWinners = [
  { name: "João M.", time: "há 5 min" },
  { name: "Maria S.", time: "há 12 min" },
  { name: "Carlos R.", time: "há 31 min" },
];

function LandingPageContent() {
  const { addToast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeText, setQrCodeText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 43, s: 21 });
  
  // Pré-cadastro
  const [showCpfForm, setShowCpfForm] = useState(false);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");

  const total = selectedPackage.price;

  // Affiliate tracking
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Affiliate tracking - read ref from URL and save to localStorage
  useEffect(() => {
    const ref = searchParams?.get("ref");
    if (ref) {
      const data = { code: ref, timestamp: Date.now() };
      localStorage.setItem("affiliate_ref", JSON.stringify(data));
      setAffiliateCode(ref);
      fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ref }),
      }).catch(console.error);
    } else {
      const saved = localStorage.getItem("affiliate_ref");
      if (saved) {
        const data = JSON.parse(saved);
        if (Date.now() - data.timestamp < 2592000000) {
          setAffiliateCode(data.code);
        } else {
          localStorage.removeItem("affiliate_ref");
        }
      }
    }
  }, [searchParams]);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  async function handlePay() {
    if (!showCpfForm) {
      setShowCpfForm(true);
      return;
    }
    
    if (!cpf || cpf.length < 11) {
      addToast("Por favor, digite um CPF válido com 11 dígitos.", "warning");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          quantity, 
          amount: total, 
          cpf, 
          name: name || undefined,
          affiliateCode: affiliateCode || undefined,
        }),
      });
      const data = await res.json();
      setPaymentId(data.paymentId);
      setQrCode(data.qrCode || null);
      setQrCodeText(data.qrCodeText || null);
      setShowModal(true);
      setShowCpfForm(false);
    } catch {
      addToast("Erro ao gerar pagamento. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handlePackageSelect = (pkg: typeof PACKAGES[0]) => {
    setSelectedPackage(pkg);
    setQuantity(pkg.quantity);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Floating beer particles background */}
      <FloatingBeers />

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,215,0,0.08) 0%, transparent 70%)",
        }}
      />

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Banner Carousel */}
        <BannerCarousel images={BANNER_IMAGES} autoPlayInterval={6000} />

        {/* Urgency banner - PROFISSIONAL */}
        <div className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 border border-red-500/40 text-red-300 rounded-full px-5 py-2 text-sm font-semibold shadow-lg shadow-red-500/10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span>Promoção exclusiva termina em</span>
          <span className="font-mono font-bold text-white bg-red-500/30 px-2 py-0.5 rounded">
            {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
          </span>
        </div>

        {/* Player Counter - Live indicator */}
        <div className="mb-4">
          <PlayerCounter baseCount={1247} />
        </div>

        {/* Title - PROFISSIONAL */}
        <div className="text-5xl md:text-6xl mb-2">🍺</div>
        <h1
          className="text-4xl md:text-5xl font-black mb-2 leading-tight tracking-tight"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Raspadinha da Sorte
        </h1>
        <h2 className="text-lg md:text-xl font-medium text-zinc-300 mb-3">
          Concorra a prêmios incríveis instantaneamente
        </h2>
        <p className="text-zinc-400 text-sm mb-8 max-w-md">
          A partir de{" "}
          <span className="text-yellow-400 font-bold text-lg">R$ 5,00</span>{" "}
          por raspadinha. Resultado imediato, pagamento via PIX.
        </p>

        {/* Packages selector - BOTÕES PROFISSIONAIS */}
        <div className="mb-8 w-full max-w-md">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-4">
            Selecione seu pacote
          </p>
          <div className="grid grid-cols-3 gap-3">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  selectedPackage.id === pkg.id
                    ? "border-yellow-500 bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 shadow-lg shadow-yellow-500/20"
                    : "border-zinc-700 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-800"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                    MAIS POPULAR
                  </div>
                )}
                <div className={`text-3xl font-black mb-1 ${
                  selectedPackage.id === pkg.id ? "text-yellow-400" : "text-white"
                }`}>
                  {pkg.quantity}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium mb-1">raspadinhas</div>
                <div className={`text-sm font-bold ${
                  selectedPackage.id === pkg.id ? "text-yellow-400" : "text-zinc-300"
                }`}>
                  R$ {pkg.price}
                </div>
                {pkg.save && (
                  <div className="text-[9px] text-emerald-400 mt-1 font-medium">
                    Economize R$ {pkg.save}
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Resumo do pacote - PROFISSIONAL */}
          <div className="mt-5 p-4 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-700/50 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-zinc-400 text-sm">Pacote selecionado</span>
              <span className="text-white font-semibold">{selectedPackage.label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Valor total</span>
              <span className="text-yellow-400 font-black text-2xl">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de CPF (pré-cadastro) */}
        {showCpfForm ? (
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-700 rounded-2xl p-6 mb-4">
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              📋 Complete seu cadastro
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome (opcional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="000.000.000-00"
                  maxLength={11}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
                <p className="text-xs text-zinc-500 mt-1">Digite apenas números (11 dígitos)</p>
              </div>
              
              <button
                onClick={handlePay}
                disabled={loading || cpf.length < 11}
                className="w-full py-4 font-bold text-base rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: loading || cpf.length < 11
                    ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
                    : "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                  color: loading || cpf.length < 11 ? "#374151" : "#000",
                }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar para pagamento</span>
                    <span>→</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowCpfForm(false)}
                className="w-full py-2 text-zinc-500 text-sm hover:text-zinc-400 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        ) : (
          /* CTA - Botão Pagar com Pix - PROFISSIONAL */
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full max-w-sm py-4 px-8 font-bold text-base rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
            style={{
              background: loading
                ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
                : "linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
              color: loading ? "#374151" : "#000",
              boxShadow: loading
                ? "none"
                : "0 10px 40px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(251, 191, 36, 0.3)",
            }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <span className="text-lg">💳</span>
                <span>Pagar com PIX</span>
                <span className="text-sm opacity-70">→</span>
              </>
            )}
          </button>
        )}

        {/* Trust - PROFISSIONAL */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span>
            <span>Pagamento seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span>
            <span>Resultado instantâneo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span>
            <span>Sem burocracia</span>
          </div>
        </div>

        {/* Recent Winners Ticker - AUTO SCROLLING */}
        <div className="mt-10 w-full flex justify-center">
          <RecentWinnersTicker />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-4 text-center text-zinc-700 text-xs border-t border-zinc-900">
        Raspadinha da Sorte &copy; {new Date().getFullYear()} &nbsp;·&nbsp;
        <a href="/admin" className="hover:text-zinc-500 transition-colors">
          Admin
        </a>
      </footer>

      {/* Modal */}
      {showModal && paymentId && (
        <PixModal
          paymentId={paymentId}
          amount={total}
          qrCode={qrCode}
          qrCodeText={qrCodeText}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// Export principal com Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  );
}

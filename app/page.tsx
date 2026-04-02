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
import PromoPopup from "@/components/PromoPopup";
import SocialProofSection from "@/components/SocialProofSection";

const PRICE_PER_ATTEMPT = 5; // R$ 5,00 (mínimo do Asaas)

// Pacotes com desconto
const PACKAGES = [
  { id: 1, quantity: 1, price: 5, label: "1 Tentativa", popular: false },
  { id: 2, quantity: 3, price: 12, label: "3 Tentativas", popular: true, save: 3 },
  { id: 3, quantity: 5, price: 20, label: "5 Tentativas", popular: false, save: 5 },
];

// Configuração das imagens do banner
const BANNER_IMAGES: { src: string; alt: string; type?: "video" | "image" }[] = [
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
  const [whatsapp, setWhatsapp] = useState("");

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
      console.log("[Frontend] Enviando request para /api/pix/create", { quantity, amount: total, cpf, name });
      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          quantity, 
          amount: total, 
          cpf, 
          name: name || undefined,
          whatsapp: whatsapp || undefined,
          affiliateCode: affiliateCode || undefined,
        }),
      });
      const data = await res.json();
      console.log("[Frontend] Resposta da API:", data);
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar pagamento");
      }
      
      if (!data.qrCode && !data.pixId) {
        throw new Error("QR Code não gerado. Verifique a configuração do Asaas.");
      }
      
      setPaymentId(data.paymentId);
      setQrCode(data.qrCode || null);
      setQrCodeText(data.qrCodeText || null);
      setShowModal(true);
      setShowCpfForm(false);
    } catch (error: any) {
      console.error("[Frontend] Erro:", error);
      addToast(error.message || "Erro ao gerar pagamento. Tente novamente.", "error");
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
      {/* Pop-up Promocional - aparece imediatamente */}
      <PromoPopup />

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
        <div className="w-full -mt-4 mb-6">
          <BannerCarousel images={BANNER_IMAGES} autoPlayInterval={6000} />
        </div>

        {/* Urgency Banner - ABAIXO DO CARROSSEL */}
        <div className="w-full max-w-2xl bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 border border-red-500/40 rounded-xl px-4 py-3 mb-4 flex items-center justify-center gap-2 text-sm animate-pulse">
          <span className="font-semibold text-red-200">Promoção exclusiva termina em</span>
          <span className="font-mono font-bold text-white bg-red-500/40 px-3 py-1 rounded-lg text-base">
            {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
          </span>
        </div>

        {/* Player Counter */}
        <div className="mb-3">
          <PlayerCounter baseCount={1247} />
        </div>

        {/* Title - FONTE POPPINS REFINADA */}
        <div className="text-center mb-6">
          <h1
            className="text-4xl md:text-6xl font-bold mb-2 leading-tight tracking-tight"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            Raspadinha da Sorte
          </h1>
          <h2 
            className="text-xl md:text-2xl font-medium text-zinc-300 mb-3"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Raspe, pague via PIX e descubra na hora se ganhou sua caixa de Corona, Stella ou Heineken!
          </h2>
        </div>

        {/* Packages selector - CARDS PROFISSIONAIS DE VENDAS */}
        <div className="mb-6 w-full max-w-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-zinc-300 text-sm font-medium">
              Escolha seu pacote de raspadinhas
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className={`relative group p-5 rounded-2xl border-2 transition-all duration-300 ${
                  selectedPackage.id === pkg.id
                    ? "border-yellow-400 bg-gradient-to-b from-yellow-500/30 via-yellow-500/20 to-yellow-600/10 shadow-xl shadow-yellow-500/30 scale-105"
                    : "border-zinc-600/50 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 hover:border-yellow-500/50 hover:bg-zinc-800 hover:scale-102"
                }`}
              >
                {/* Badge MAIS POPULAR */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 animate-pulse">
                    MAIS POPULAR
                  </div>
                )}
                
                {/* Ícone de check para selecionado */}
                {selectedPackage.id === pkg.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                {/* Quantidade */}
                <div className={`text-4xl font-black mb-2 ${
                  selectedPackage.id === pkg.id ? "text-yellow-300" : "text-white group-hover:text-yellow-200"
                }`}>
                  {pkg.quantity}
                </div>
                
                {/* Label */}
                <div className="text-xs text-zinc-400 font-medium mb-2">
                  {pkg.quantity === 1 ? "raspadinha" : "raspadinhas"}
                </div>
                
                {/* Preço */}
                <div className={`text-lg font-bold ${
                  selectedPackage.id === pkg.id ? "text-yellow-300" : "text-white"
                }`}>
                  R$ {pkg.price}
                </div>
                
                {/* Economia */}
                {pkg.save && (
                  <div className="mt-2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Economize R$ {pkg.save}
                    </span>
                  </div>
                )}
                
                {/* Valor unitário */}
                <div className="mt-2 text-[10px] text-zinc-500">
                  {Math.round(pkg.price / pkg.quantity * 100) / 100}/un
                </div>
              </button>
            ))}
          </div>
          
          {/* Resumo do pedido - CARD DESTACADO */}
          <div className="mt-6 p-5 bg-gradient-to-r from-zinc-900/90 via-zinc-800/90 to-zinc-900/90 border border-yellow-500/30 rounded-2xl backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-300 font-medium">Resumo do pedido</span>
              <span className="text-white font-semibold bg-yellow-500/20 px-3 py-1 rounded-full text-sm">
                {selectedPackage.label}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t border-zinc-700/50 pt-3">
              <div className="text-zinc-400 text-sm">
                <span>Total a pagar</span>
                <div className="text-xs text-zinc-500 mt-0.5">Pagamento via PIX</div>
              </div>
              <span className="text-yellow-400 font-black text-3xl">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de CPF (pré-cadastro) */}
        {showCpfForm ? (
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-700 rounded-2xl p-6 mb-4">
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              Complete seu cadastro
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
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">WhatsApp *</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="(11) 99999-9999"
                  maxLength={11}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
                <p className="text-xs text-zinc-500 mt-1">Digite apenas números com DDD (11 dígitos)</p>
              </div>
              
              <button
                onClick={handlePay}
                disabled={loading || cpf.length < 11 || whatsapp.length < 11}
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
          <button
            onClick={handlePay}
            disabled={loading}
            className="group w-full max-w-lg py-5 px-10 font-bold text-lg rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl hover:shadow-yellow-500/30"
            style={{
              background: loading
                ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
                : "linear-gradient(135deg, #FCD34D 0%, #F59E0B 40%, #D97706 100%)",
              color: loading ? "#374151" : "#000",
              boxShadow: loading
                ? "none"
                : "0 12px 40px rgba(245, 158, 11, 0.5), 0 0 0 2px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <span>COMPRAR AGORA</span>
              <span className="text-base opacity-80 group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </button>
        )}
        
        {/* Selos de segurança */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full">
            <span>Pagamento 100% seguro</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full">
            <span>Resultado instantâneo</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full">
            <span>Sem burocracia</span>
          </div>
        </div>

        {/* Recent Winners Ticker - AUTO SCROLLING */}
        <div className="mt-10 w-full flex justify-center">
          <RecentWinnersTicker />
        </div>

        {/* Social Proof Section */}
        <div className="mt-10 w-full">
          <SocialProofSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center border-t border-zinc-900">
        {/* Security Badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-4 px-4">
          {/* Google Safe Browsing */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">Google Safe Browsing</span>
          </div>
          
          {/* SSL Secure */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">SSL 256-bit Secure</span>
          </div>
          
          {/* Verified Payment */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">Pagamento Verificado</span>
          </div>
          
          {/* Trusted Site */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">Site Confiança 100%</span>
          </div>
        </div>
        
        <div className="text-zinc-700 text-xs">
          Raspadinha da Sorte &copy; {new Date().getFullYear()} &nbsp;·&nbsp;
          <a href="/admin" className="hover:text-zinc-500 transition-colors">
            Admin
          </a>
        </div>
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

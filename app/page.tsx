"use client";
// Deploy Vercel v2

import { useState, useEffect } from "react";
import PixModal from "@/components/PixModal";

const PRICE_PER_ATTEMPT = 5; // R$ 5,00 (mínimo do Asaas)
const MAX_TENTATIVAS = 10;

const recentWinners = [
  { name: "João M.", time: "há 5 min" },
  { name: "Maria S.", time: "há 12 min" },
  { name: "Carlos R.", time: "há 31 min" },
];

export default function LandingPage() {
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

  const total = quantity * PRICE_PER_ATTEMPT;

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
      alert("Por favor, digite um CPF válido com 11 dígitos.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, amount: total, cpf, name: name || undefined }),
      });
      const data = await res.json();
      setPaymentId(data.paymentId);
      setQrCode(data.qrCode || null);
      setQrCodeText(data.qrCodeText || null);
      setShowModal(true);
      setShowCpfForm(false);
    } catch {
      alert("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,215,0,0.08) 0%, transparent 70%)",
        }}
      />

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Urgency banner */}
        <div className="mb-6 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full px-4 py-1.5 text-sm font-medium">
          <span className="animate-pulse">🔴</span>
          Oferta por tempo limitado! &nbsp;
          <span className="font-mono font-bold">
            {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
          </span>
        </div>

        {/* Title */}
        <div className="text-5xl md:text-6xl mb-3">🍺</div>
        <h1
          className="text-4xl md:text-6xl font-black mb-3 leading-tight"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Raspadinha da Sorte
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-zinc-200 mb-2">
          Concorra a uma Caixa de Cerveja!
        </h2>
        <p className="text-zinc-400 text-base mb-8">
          Por apenas{" "}
          <span className="text-yellow-400 font-bold">R$ 2,50</span> por
          tentativa • Raspe e ganhe na hora!
        </p>

        {/* Prize card */}
        <div
          className="mb-8 p-6 rounded-2xl max-w-xs w-full border"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,165,0,0.05) 100%)",
            borderColor: "rgba(255,215,0,0.25)",
            boxShadow: "0 0 40px rgba(255,215,0,0.06)",
          }}
        >
          <div className="text-5xl mb-3">🍻</div>
          <div className="text-yellow-500 font-bold text-sm uppercase tracking-widest mb-1">
            🏆 Prêmio
          </div>
          <div className="text-white font-black text-xl">
            Caixa Heineken 24 latas
          </div>
          <div className="text-zinc-500 text-sm mt-1">Valor: R$ 89,90</div>
        </div>

        {/* Quantity selector */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="text-zinc-400 text-sm font-medium">
            Quantidade de tentativas:
          </span>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 text-white text-xl font-bold hover:bg-zinc-700 active:scale-95 transition-all"
            >
              −
            </button>
            <span className="text-4xl font-black text-yellow-400 w-14 text-center tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(MAX_TENTATIVAS, q + 1))}
              className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 text-white text-xl font-bold hover:bg-zinc-700 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
          <div className="text-xl font-bold text-white">
            Total:{" "}
            <span className="text-yellow-400">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
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
                className="w-full py-4 font-black text-lg rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading || cpf.length < 11
                    ? "#B8860B"
                    : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  color: "#000",
                }}
              >
                {loading ? "⏳ Gerando Pix..." : "⚡ CONTINUAR"}
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
          /* CTA - Botão Pagar com Pix */
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full max-w-xs py-5 px-8 font-black text-lg rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? "#B8860B"
                : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              color: "#000",
              boxShadow: loading
                ? "none"
                : "0 8px 32px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)",
            }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(255,215,0,0.45), 0 0 0 1px rgba(255,215,0,0.3)";
            }}
            onMouseLeave={(e) => {
              if (!loading)
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)";
            }}
          >
            {loading ? "⏳ Gerando Pix..." : "⚡ PAGAR COM PIX"}
          </button>
        )}

        {/* Trust */}
        <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-zinc-600">
          <span>🔒 Pagamento seguro</span>
          <span>⚡ Resultado imediato</span>
          <span>✅ Sem cadastro</span>
        </div>

        {/* Recent winners */}
        <div className="mt-12 w-full max-w-xs">
          <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-3">
            🏆 Ganhadores recentes
          </div>
          <div className="space-y-2">
            {recentWinners.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm"
              >
                <span className="text-zinc-300 font-medium">
                  🎉 {w.name} ganhou!
                </span>
                <span className="text-zinc-600 text-xs">{w.time}</span>
              </div>
            ))}
          </div>
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

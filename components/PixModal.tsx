"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PixModalProps {
  paymentId: string;
  amount: number;
  onClose: () => void;
}

export default function PixModal({ paymentId, amount, onClose }: PixModalProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "paid">("pending");
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY ?? "raspadinha@exemplo.com";

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/pix/status/${paymentId}`);
      const data = await res.json();
      if (data.status === "paid" && data.sessionId) {
        setStatus("paid");
        router.push(`/game?session=${data.sessionId}`);
      }
    } catch {
      // ignore
    }
  }, [paymentId, router]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, [checkStatus]);

  async function simulatePayment() {
    setSimulating(true);
    try {
      const res = await fetch(`/api/pix/simulate/${paymentId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.sessionId) {
        setStatus("paid");
        router.push(`/game?session=${data.sessionId}`);
      }
    } finally {
      setSimulating(false);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-2">📲</div>
        <h3 className="text-xl font-black text-white mb-1">Pague com Pix</h3>
        <p className="text-zinc-400 text-sm mb-5">
          Escaneie o QR Code ou use a chave
        </p>

        {/* QR Code placeholder */}
        <div className="mx-auto mb-4 w-44 h-44 bg-white rounded-2xl flex flex-col items-center justify-center shadow-inner">
          <div className="text-4xl mb-1">📱</div>
          <div className="text-zinc-500 text-xs text-center px-3 leading-snug">
            QR Code Pix
            <br />
            <span className="font-mono text-[10px] break-all">{paymentId.slice(0, 12)}...</span>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4 text-3xl font-black text-yellow-400">
          R$ {amount.toFixed(2).replace(".", ",")}
        </div>

        {/* Pix key */}
        <button
          onClick={copyKey}
          className="w-full mb-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-300 font-mono break-all transition-colors text-center"
        >
          {pixKey}
          <span className="block text-xs text-zinc-500 mt-1">
            {copied ? "✅ Copiado!" : "👆 Toque para copiar"}
          </span>
        </button>

        {/* Status */}
        <div className="mb-4 flex items-center justify-center gap-2 text-sm min-h-[24px]">
          {status === "pending" ? (
            <>
              <span className="animate-pulse text-yellow-400">⏳</span>
              <span className="text-zinc-400">Aguardando pagamento...</span>
            </>
          ) : (
            <>
              <span className="text-emerald-400">✅</span>
              <span className="text-emerald-400">Pago! Redirecionando...</span>
            </>
          )}
        </div>

        {/* Simular (dev) */}
        <button
          onClick={simulatePayment}
          disabled={simulating || status === "paid"}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors mb-3"
        >
          {simulating ? "⏳ Processando..." : "✅ Simular Pagamento"}
        </button>

        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

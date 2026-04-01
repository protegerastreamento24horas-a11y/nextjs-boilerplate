"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

interface PixModalProps {
  paymentId: string;
  amount: number;
  qrCode?: string | null;
  qrCodeText?: string | null;
  onClose: () => void;
}

export default function PixModal({ paymentId, amount, qrCode, qrCodeText, onClose }: PixModalProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "paid" | "confirmed">("pending");
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const isRealPix = !!qrCode && !!qrCodeText;

  const checkStatus = useCallback(async () => {
    try {
      setLastChecked(new Date());
      const res = await fetch(`/api/pix/status/${paymentId}`);
      const data = await res.json();
      
      if (data.status === "paid" && data.sessionId) {
        setStatus("confirmed");
        // Aguarda 1.5 segundos para mostrar a animação de confirmação antes de redirecionar
        setTimeout(() => {
          router.push(`/game?session=${data.sessionId}`);
        }, 1500);
      }
    } catch (err) {
      console.error("[PixModal] Erro ao verificar status:", err);
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

  function copyPixCode() {
    const codeToCopy = isRealPix ? qrCodeText : "raspadinha@exemplo.com";
    navigator.clipboard.writeText(codeToCopy || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-2">📲</div>
        <h3 className="text-xl font-black text-white mb-1">Pague com Pix</h3>
        <p className="text-zinc-400 text-sm mb-5">
          {isRealPix ? "Escaneie o QR Code ou copie o código" : "Use a chave Pix simulada"}
        </p>

        {/* QR Code */}
        <div className="mx-auto mb-4 w-44 h-44 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
          {isRealPix ? (
            <Image
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code Pix"
              width={160}
              height={160}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3">
              <div className="text-4xl mb-1">📱</div>
              <div className="text-zinc-500 text-xs text-center">
                QR Code Simulado
                <br />
                <span className="font-mono text-[10px] break-all">{paymentId.slice(0, 12)}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4 text-3xl font-black text-yellow-400">
          R$ {amount.toFixed(2).replace(".", ",")}
        </div>

        {/* Pix Code */}
        <button
          onClick={copyPixCode}
          className="w-full mb-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-300 font-mono break-all transition-colors text-center"
        >
          {isRealPix ? (
            <>
              {qrCodeText?.slice(0, 40)}...
              <span className="block text-xs text-zinc-500 mt-1">
                {copied ? "✅ Copiado!" : "👆 Toque para copiar código Pix"}
              </span>
            </>
          ) : (
            <>
              raspadinha@exemplo.com
              <span className="block text-xs text-zinc-500 mt-1">
                {copied ? "✅ Copiado!" : "👆 Toque para copiar"}
              </span>
            </>
          )}
        </button>

        {/* Status */}
        <div className="mb-4 flex flex-col items-center justify-center gap-2 text-sm min-h-[60px]">
          {status === "pending" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="animate-pulse text-yellow-400 text-xl">⏳</span>
                <span className="text-zinc-400">Aguardando pagamento...</span>
              </div>
              <span className="text-xs text-zinc-600">
                Última verificação: {lastChecked.toLocaleTimeString()}
              </span>
            </>
          ) : status === "confirmed" ? (
            <>
              <div className="flex items-center gap-2 animate-bounce">
                <span className="text-emerald-400 text-2xl">🎉</span>
                <span className="text-emerald-400 font-bold text-lg">Pagamento confirmado!</span>
              </div>
              <span className="text-emerald-500 text-xs">Redirecionando para o jogo...</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-xl">✅</span>
                <span className="text-emerald-400">Pago! Redirecionando...</span>
              </div>
            </>
          )}
        </div>

        {/* Simular (apenas em modo simulado) */}
        {!isRealPix && (
          <button
            onClick={simulatePayment}
            disabled={simulating || status === "paid"}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors mb-3 flex items-center justify-center gap-2"
          >
            {simulating ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <span>✅ Simular Pagamento</span>
              </>
            )}
          </button>
        )}

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

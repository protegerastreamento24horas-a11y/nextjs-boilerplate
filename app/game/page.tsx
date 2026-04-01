"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ScratchCard from "@/components/ScratchCard";
import Tutorial from "@/components/Tutorial";
import Confetti from "@/components/Confetti";
import WinAnimation from "@/components/WinAnimation";
import { useToast } from "@/components/ToastContext";

interface GameSession {
  sessionId: string;
  revealed: number[];
  maxReveals: number;
  isDone: boolean;
  isWinner: boolean;
}

function GameContent() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get("session") || null;

  const [session, setSession] = useState<GameSession | null>(null);
  const [cardResults, setCardResults] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("Sessão não encontrada. Faça um novo pagamento.");
      setLoading(false);
      return;
    }
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const [showWinAnimation, setShowWinAnimation] = useState(false);

  useEffect(() => {
    if (session?.isWinner) {
      setShowWinAnimation(true);
    }
  }, [session?.isWinner]);

  async function fetchSession() {
    try {
      const res = await fetch(`/api/game/session?id=${sessionId}`);
      if (!res.ok) throw new Error("Sessão inválida");
      const data = await res.json();
      setSession(data);
      addToast("Pagamento confirmado! Boa sorte! 🍀", "success");
    } catch {
      setError("Sessão inválida ou expirada. Volte e faça um novo pagamento.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReveal(cardIndex: number) {
    if (!session || session.isDone || revealing) return;
    if (session.revealed.includes(cardIndex)) return;
    if (session.revealed.length >= session.maxReveals) return;

    setRevealing(true);
    try {
      const res = await fetch("/api/game/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, cardIndex }),
      });
      if (!res.ok) return;
      const data = await res.json();

      setCardResults((prev) => ({ ...prev, [cardIndex]: data.result }));
      setSession((prev) =>
        prev
          ? {
              ...prev,
              revealed: data.revealed,
              isDone: data.isDone,
              isWinner: data.isWinner,
            }
          : null
      );
    } finally {
      setRevealing(false);
    }
  }

  const remainingReveals = session
    ? session.maxReveals - session.revealed.length
    : 3;
  const canReveal = !session?.isDone && remainingReveals > 0 && !revealing;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-yellow-400 text-xl animate-pulse">
          🎴 Carregando jogo...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="text-5xl">😕</div>
        <div className="text-red-400 text-lg max-w-sm">{error}</div>
        <button
          onClick={() => router.push("/")}
          className="mt-2 py-3 px-6 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <Tutorial />
      
      {/* Win Animation and Confetti */}
      <Confetti active={showWinAnimation} duration={5000} />
      <WinAnimation active={showWinAnimation} />

      {/* Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,215,0,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1
            className="text-2xl sm:text-3xl font-black mb-1"
            style={{
              background:
                "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🎴 Raspadinha
          </h1>

          {session?.isDone ? (
            session.isWinner ? (
              <div className="mt-2">
                <div className="text-2xl font-black text-emerald-400 animate-bounce">
                  🎉 VOCÊ GANHOU!
                </div>
                <div className="text-emerald-500 text-sm mt-1">
                  Parabéns! Entre em contato para retirar o prêmio.
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-lg font-bold text-zinc-400">
                  Não foi dessa vez...
                </div>
                <div className="text-zinc-600 text-sm mt-0.5">
                  Tente novamente e boa sorte! 🍀
                </div>
              </div>
            )
          ) : (
            <p className="text-zinc-400 text-sm mt-1">
              Raspe as cartelas para revelar! &nbsp;
              <span className="text-yellow-400 font-bold">
                {remainingReveals}{" "}
                {remainingReveals === 1
                  ? "tentativa restante"
                  : "tentativas restantes"}
              </span>
            </p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {Array.from({ length: session?.maxReveals ?? 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                i < (session?.revealed.length ?? 0)
                  ? "bg-yellow-400 border-yellow-400 shadow-sm shadow-yellow-400/50"
                  : "bg-transparent border-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Instruction */}
        {!session?.isDone && (
          <p className="text-center text-zinc-600 text-xs mb-4">
            👆 Clique e arraste sobre as cartelas para raspar
          </p>
        )}

        {/* Scratch cards grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-6 sm:mb-8 px-1 sm:px-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <ScratchCard
              key={i}
              index={i}
              isRevealed={session?.revealed.includes(i) ?? false}
              result={cardResults[i]}
              canReveal={canReveal && !(session?.revealed.includes(i) ?? false)}
              onReveal={handleReveal}
            />
          ))}
        </div>

        {/* Done state */}
        {session?.isDone && (
          <div className="flex flex-col items-center gap-4">
            {session.isWinner && (
              <div className="w-full p-5 bg-emerald-900/30 border border-emerald-500/40 rounded-2xl text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-emerald-400 font-black text-lg">
                  Prêmio: Caixa Heineken 24 latas
                </div>
                <div className="text-zinc-400 text-sm mt-1">
                  Entre em contato com o bar para retirar
                </div>
              </div>
            )}
            <button
              onClick={() => router.push("/")}
              className="py-4 px-10 font-black text-lg rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "#000",
                boxShadow: "0 8px 24px rgba(255,215,0,0.25)",
              }}
            >
              🎮 Jogar Novamente
            </button>
          </div>
        )}

        {/* Session ID (debug) */}
        {sessionId && (
          <div className="mt-8 text-center text-zinc-800 text-[10px] font-mono">
            Sessão: {sessionId}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-yellow-400 text-xl animate-pulse">
            🎴 Carregando...
          </div>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}

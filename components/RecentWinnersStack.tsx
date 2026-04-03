"use client";

import { useEffect, useState } from "react";

interface Winner {
  id: number;
  name: string;
  amount: string;
  value: number;
  time: string;
}

const WINNERS: Winner[] = [
  { id: 1, name: "Maria Julia", amount: "R$ 500,00", value: 500, time: "agora" },
  { id: 2, name: "Cristian R.", amount: "R$ 1.500,00", value: 1500, time: "há 2 min" },
  { id: 3, name: "Ana P.", amount: "R$ 500,00", value: 500, time: "há 3 min" },
  { id: 4, name: "Carlos R.", amount: "R$ 1.000,00", value: 1000, time: "há 5 min" },
  { id: 5, name: "Fernanda L.", amount: "R$ 500,00", value: 500, time: "há 7 min" },
  { id: 6, name: "Pedro H.", amount: "R$ 2.000,00", value: 2000, time: "há 9 min" },
  { id: 7, name: "Juliana M.", amount: "R$ 500,00", value: 500, time: "há 11 min" },
  { id: 8, name: "Ricardo B.", amount: "R$ 1.500,00", value: 1500, time: "há 13 min" },
  { id: 9, name: "Camila T.", amount: "R$ 500,00", value: 500, time: "há 15 min" },
  { id: 10, name: "Bruno S.", amount: "R$ 1.000,00", value: 1000, time: "há 17 min" },
  { id: 11, name: "Luiza A.", amount: "R$ 500,00", value: 500, time: "há 19 min" },
  { id: 12, name: "Gabriel K.", amount: "R$ 3.000,00", value: 3000, time: "há 21 min" },
];

const VALUE_COLORS = {
  gold: { gradient: "from-yellow-400 via-yellow-500 to-yellow-600", glow: "rgba(255,215,0,0.7)", border: "rgba(255,215,0,0.5)" },
};

function getColorConfig() {
  return VALUE_COLORS.gold;
}

export default function RecentWinnersStack() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % WINNERS.length);
        setIsAnimating(false);
      }, 500);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getCardStyle = (offset: number): React.CSSProperties => {
    const isCurrent = offset === 0;
    const isNext1 = offset === 1;
    const isNext2 = offset === 2;
    const isNext3 = offset === 3;
    
    if (isAnimating && isCurrent) {
      return {
        transform: "translateY(-130%) scale(0.85)",
        opacity: 0,
        zIndex: 40,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }
    
    if (isAnimating && isNext1) {
      return {
        transform: "translateY(0) scale(1)",
        opacity: 1,
        zIndex: 30,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }

    if (isCurrent) {
      return {
        transform: "translateY(0) scale(1)",
        opacity: 1,
        zIndex: 30,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }

    if (isNext1) {
      return {
        transform: "translateY(15px) scale(0.95)",
        opacity: 0.7,
        zIndex: 20,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }

    if (isNext2) {
      return {
        transform: "translateY(30px) scale(0.9)",
        opacity: 0.4,
        zIndex: 10,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }

    if (isNext3) {
      return {
        transform: "translateY(45px) scale(0.85)",
        opacity: 0.2,
        zIndex: 5,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }

    return {
      transform: "translateY(60px) scale(0.8)",
      opacity: 0,
      zIndex: 1,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  const getVisibleWinners = () => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentIndex + i) % WINNERS.length;
      result.push({ ...WINNERS[index], displayOffset: i });
    }
    return result;
  };

  const visibleWinners = getVisibleWinners();
  const currentWinner = visibleWinners[0];
  const colors = getColorConfig();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="relative flex items-center justify-center">
          <span className="absolute flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          </span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">
          Ganhadores em tempo real
        </span>
      </div>

      {/* Cards Stack Container */}
      <div className="relative h-52 flex items-center justify-center" style={{ perspective: "1000px" }}>
        {/* Background Glow */}
        <div
          className="absolute inset-0 rounded-3xl opacity-40 blur-3xl"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
            transition: "background 0.5s ease",
          }}
        />

        {/* Light ring effect */}
        <div
          className="absolute inset-0 rounded-3xl animate-pulse"
          style={{
            boxShadow: `0 0 60px ${colors.glow}, inset 0 0 30px ${colors.glow}`,
            opacity: 0.3,
            transition: "box-shadow 0.5s ease",
          }}
        />

        {/* Cards */}
        <div className="relative w-72 h-40">
          {visibleWinners.map((winner, index) => {
            const style = getCardStyle(index);
            const winnerColors = getColorConfig();
            const isCurrent = index === 0;

            return (
              <div
                key={`${winner.id}-${currentIndex}`}
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={style}
              >
                {/* Card Background - Golden Gradient */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"
                />

                {/* Glow effect for all cards */}
                <div
                  className="absolute -inset-1 rounded-2xl opacity-60 blur-md"
                  style={{
                    background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)",
                  }}
                />

                {/* Glassmorphism layer - no border */}
                <div
                  className="absolute inset-1 rounded-xl backdrop-blur-sm"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-xl font-bold text-black mb-3 shadow-lg"
                  >
                    {winner.name.charAt(0)}
                  </div>

                  {/* Name */}
                  <p className="text-white font-semibold text-lg mb-1">{winner.name}</p>

                  {/* Amount */}
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {winner.amount}
                  </p>

                  {/* Time and badge */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-zinc-400 text-xs">{winner.time}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Pix Recebido
                    </span>
                  </div>
                </div>

                {/* Shine effect on current card only */}
                {isCurrent && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                      animation: "shine 2s ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4">
        {WINNERS.slice(0, 5).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex % 5 ? "w-6 bg-yellow-400" : "w-1 bg-zinc-600"
            }`}
          />
        ))}
      </div>

      {/* Stats footer */}
      <div className="mt-4 text-center">
        <span className="text-zinc-500 text-xs">Total de prêmios hoje: </span>
        <span className="text-emerald-400 font-bold">{WINNERS.length * 12}</span>
      </div>

      {/* CSS for shine animation */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

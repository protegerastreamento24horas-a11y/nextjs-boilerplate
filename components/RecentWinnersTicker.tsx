"use client";

import { useEffect, useRef, useState } from "react";

interface Winner {
  id: number;
  name: string;
  prize: string;
  brand: "corona" | "heineken" | "stella";
  time: string;
  amount: string;
}

const WINNERS: Winner[] = [
  { id: 1, name: "Maria Julia", prize: "R$ 500,00", brand: "corona", time: "agora", amount: "Pix recebido" },
  { id: 2, name: "Cristian R.", prize: "R$ 1.500,00", brand: "heineken", time: "há 2 min", amount: "Pix recebido" },
  { id: 3, name: "Ana P.", prize: "R$ 500,00", brand: "stella", time: "há 3 min", amount: "Pix recebido" },
  { id: 4, name: "Carlos R.", prize: "R$ 1.000,00", brand: "corona", time: "há 5 min", amount: "Pix recebido" },
  { id: 5, name: "Fernanda L.", prize: "R$ 500,00", brand: "heineken", time: "há 7 min", amount: "Pix recebido" },
  { id: 6, name: "Pedro H.", prize: "R$ 2.000,00", brand: "stella", time: "há 9 min", amount: "Pix recebido" },
  { id: 7, name: "Juliana M.", prize: "R$ 500,00", brand: "corona", time: "há 11 min", amount: "Pix recebido" },
  { id: 8, name: "Ricardo B.", prize: "R$ 1.500,00", brand: "heineken", time: "há 13 min", amount: "Pix recebido" },
  { id: 9, name: "Camila T.", prize: "R$ 500,00", brand: "stella", time: "há 15 min", amount: "Pix recebido" },
  { id: 10, name: "Bruno S.", prize: "R$ 1.000,00", brand: "corona", time: "há 17 min", amount: "Pix recebido" },
  { id: 11, name: "Luiza A.", prize: "R$ 500,00", brand: "heineken", time: "há 19 min", amount: "Pix recebido" },
  { id: 12, name: "Gabriel K.", prize: "R$ 3.000,00", brand: "stella", time: "há 21 min", amount: "Pix recebido" },
];

const BRAND_COLORS = {
  corona: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    badge: "bg-blue-500",
    icon: "💰",
  },
  heineken: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
    badge: "bg-green-500",
    icon: "💰",
  },
  stella: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    badge: "bg-amber-500",
    icon: "💰",
  },
};

export default function RecentWinnersTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let lastTime = 0;
    const speed = 0.5; // pixels per frame

    const animate = (currentTime: number) => {
      if (!isPaused) {
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime >= 16) { // ~60fps
          scrollPositionRef.current += speed;
          
          // Reset when we've scrolled through half the content (first set of items)
          const halfHeight = scrollContainer.scrollHeight / 2;
          if (scrollPositionRef.current >= halfHeight) {
            scrollPositionRef.current = 0;
          }
          
          scrollContainer.scrollTop = scrollPositionRef.current;
          lastTime = currentTime;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused]);

  // Duplicate winners for seamless loop
  const duplicatedWinners = [...WINNERS, ...WINNERS];

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="relative flex items-center justify-center">
          <span className="absolute flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          </span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </div>
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
          Ganhadores em tempo real
        </span>
      </div>

      {/* Ticker Container */}
      <div 
        className="relative h-80 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-zinc-950/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-950/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Content */}
        <div 
          ref={scrollRef}
          className="h-full overflow-hidden"
        >
          <div className="py-2 space-y-2">
            {duplicatedWinners.map((winner, index) => {
              const colors = BRAND_COLORS[winner.brand];
              return (
                <div
                  key={`${winner.id}-${index}`}
                  className={`mx-3 p-3 rounded-xl border ${colors.bg} ${colors.border} flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full ${colors.badge} flex items-center justify-center text-lg font-bold text-white shrink-0`}>
                    {winner.name.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm truncate">
                        {winner.name}
                      </span>
                      <span className={`text-[10px] ${colors.text} font-medium`}>
                        {winner.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-lg">{colors.icon}</span>
                      <span className={`${colors.text} text-xs font-bold`}>
                        {winner.prize}
                      </span>
                    </div>
                    <div className="text-zinc-500 text-[10px] mt-0.5">
                      {winner.amount}
                    </div>
                  </div>

                  {/* Winner Badge */}
                  <div className="shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      ✓ GANHOU
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pause Indicator */}
        {isPaused && (
          <div className="absolute top-2 right-2 z-20">
            <span className="text-[10px] text-zinc-500 bg-zinc-800/80 px-2 py-1 rounded-full">
              Pausado
            </span>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>Total de ganhadores hoje:</span>
        <span className="text-emerald-400 font-bold">{WINNERS.length * 8} prêmios</span>
      </div>
    </div>
  );
}

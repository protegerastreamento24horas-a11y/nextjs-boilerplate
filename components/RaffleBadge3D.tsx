"use client";

import { useMemo } from "react";

interface RaffleBadge3DProps {
  totalParticipants: number;
  probability?: number;
  prizeValue?: number;
  ticketPrice?: number;
  index: number;
}

type BadgeType = "hot" | "popular" | "premium" | "top-chance" | null;

interface BadgeConfig {
  type: BadgeType;
  label: string;
  emoji: string;
  gradient: string;
  shadowColor: string;
  rotation: number;
}

export function RaffleBadge3D({
  totalParticipants,
  probability = 50,
  prizeValue = 100,
  ticketPrice = 10,
  index,
}: RaffleBadge3DProps) {
  const badge = useMemo<BadgeConfig | null>(() => {
    // Lógica de randomização baseada em métricas
    const scores = {
      hot: probability > 70 ? probability : 0,
      popular: totalParticipants > 100 ? totalParticipants : 0,
      premium: prizeValue > 500 ? prizeValue : 0,
      "top-chance": ticketPrice > 0 ? (prizeValue / ticketPrice) : 0,
    };

    // Encontrar o maior score
    const maxScore = Math.max(...Object.values(scores));
    
    // Se nenhum badge se aplica, retorna null (exceto para o primeiro card que sempre tem um)
    if (maxScore === 0 && index !== 0) return null;

    // Determinar qual badge venceu
    let winner: BadgeType = "hot";
    if (scores.popular === maxScore) winner = "popular";
    else if (scores.premium === maxScore) winner = "premium";
    else if (scores["top-chance"] === maxScore) winner = "top-chance";

    // Se for o primeiro card e nenhum badge se aplica, coloca "hot" por padrão
    if (maxScore === 0 && index === 0) winner = "hot";

    // Configurações visuais para cada tipo
    const configs: Record<Exclude<BadgeType, null>, Omit<BadgeConfig, "type">> = {
      hot: {
        label: "QUENTE",
        emoji: "🔥",
        gradient: "linear-gradient(135deg, #FF6B35 0%, #FF4500 50%, #DC143C 100%)",
        shadowColor: "rgba(255, 69, 0, 0.6)",
        rotation: -12,
      },
      popular: {
        label: "TOP",
        emoji: "⭐",
        gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
        shadowColor: "rgba(255, 215, 0, 0.6)",
        rotation: 8,
      },
      premium: {
        label: "PREMIUM",
        emoji: "💎",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        shadowColor: "rgba(102, 126, 234, 0.6)",
        rotation: -8,
      },
      "top-chance": {
        label: "TOP CHANCE",
        emoji: "🎯",
        gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #00d2ff 100%)",
        shadowColor: "rgba(17, 153, 142, 0.6)",
        rotation: 12,
      },
    };

    return { type: winner, ...configs[winner] };
  }, [totalParticipants, probability, prizeValue, ticketPrice, index]);

  if (!badge) return null;

  return (
    <div
      className="absolute -top-2 -right-2 z-20 animate-bounce-in"
      style={{
        transform: `rotate(${badge.rotation}deg)`,
        animation: "badgeFloat 3s ease-in-out infinite",
      }}
    >
      {/* Badge 3D Container */}
      <div
        className="relative px-3 py-1.5 rounded-lg font-black text-white text-xs tracking-wider"
        style={{
          background: badge.gradient,
          boxShadow: `
            0 4px 0 rgba(0,0,0,0.3),
            0 6px 12px ${badge.shadowColor},
            inset 0 1px 0 rgba(255,255,255,0.4),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* Shine overlay */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
            animation: "shine 2s ease-in-out infinite",
          }}
        />
        
        {/* Content */}
        <div className="relative flex items-center gap-1">
          <span className="text-sm">{badge.emoji}</span>
          <span>{badge.label}</span>
        </div>

        {/* Glow effect */}
        <div
          className="absolute -inset-1 rounded-lg blur-md -z-10"
          style={{
            background: badge.gradient,
            opacity: 0.5,
            animation: "pulseGlow 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Pin/Ribbon effect */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-3 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, #888, #333)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
        }}
      />

      <style jsx>{`
        @keyframes badgeFloat {
          0%, 100% { transform: rotate(${badge.rotation}deg) translateY(0); }
          50% { transform: rotate(${badge.rotation}deg) translateY(-3px); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3) rotate(${badge.rotation}deg); }
          50% { transform: scale(1.1) rotate(${badge.rotation}deg); }
          100% { opacity: 1; transform: scale(1) rotate(${badge.rotation}deg); }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

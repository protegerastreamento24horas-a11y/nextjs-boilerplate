"use client";

import { useEffect, useRef, useState } from "react";

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
  500: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", glow: "rgba(59,130,246,0.5)" },
  1000: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400", glow: "rgba(16,185,129,0.5)" },
  1500: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400", glow: "rgba(249,115,22,0.5)" },
  2000: { bg: "bg-yellow-500/20", border: "border-yellow-500/40", text: "text-yellow-400", glow: "rgba(255,215,0,0.6)" },
  3000: { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-400", glow: "rgba(168,85,247,0.6)" },
};

function getColorConfig(value: number) {
  if (value >= 3000) return VALUE_COLORS[3000];
  if (value >= 2000) return VALUE_COLORS[2000];
  if (value >= 1500) return VALUE_COLORS[1500];
  if (value >= 1000) return VALUE_COLORS[1000];
  return VALUE_COLORS[500];
}

// Pre-calculated confetti positions
const CONFETTI = [
  { left: 10, delay: 0, duration: 3 },
  { left: 25, delay: 0.5, duration: 2.5 },
  { left: 40, delay: 1, duration: 3.2 },
  { left: 55, delay: 0.3, duration: 2.8 },
  { left: 70, delay: 0.8, duration: 3.5 },
  { left: 85, delay: 0.2, duration: 2.3 },
  { left: 15, delay: 1.2, duration: 3 },
  { left: 90, delay: 0.6, duration: 2.7 },
];

export default function RecentWinners3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const animationRef = useRef<number>(0);

  // Auto rotation
  useEffect(() => {
    let lastTime = 0;
    const speed = 0.4;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      if (deltaTime >= 16) {
        setRotation((prev) => (prev + speed) % 360);
        lastTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Mouse parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMouseY(y * 15);
  };

  const handleMouseLeave = () => setMouseY(0);

  // Calculate 3D position
  const getCardStyle = (index: number, total: number): React.CSSProperties => {
    const angle = (index * (360 / total) + rotation) * (Math.PI / 180);
    const radius = 320;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius - radius;
    const rotateY = -index * (360 / total) - rotation;
    const scale = (z + radius * 2) / (radius * 2) * 0.3 + 0.7;
    const opacity = Math.max(0.3, (z + radius) / radius * 0.7 + 0.3);
    const blur = z < -100 ? Math.abs(z) / 200 : 0;

    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      filter: `blur(${blur}px)`,
      zIndex: Math.round(z + radius),
    };
  };

  const duplicatedWinners = [...WINNERS, ...WINNERS];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
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

      {/* 3D Container */}
      <div
        ref={containerRef}
        className="relative h-96 overflow-hidden rounded-3xl"
        style={{ perspective: "1200px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-900" />

        {/* Light effect */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,215,0,0.4) 0%, transparent 60%)",
            filter: "blur(30px)",
            transform: `translateY(${mouseY * 0.5}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        {/* Confetti particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {CONFETTI.map((conf, i) => (
            <div
              key={i}
              className="absolute text-lg"
              style={{
                left: `${conf.left}%`,
                top: "-20px",
                animation: `fall ${conf.duration}s linear infinite`,
                animationDelay: `${conf.delay}s`,
              }}
            >
              {["🎉", "✨", "💰", "🌟"][i % 4]}
            </div>
          ))}
        </div>

        {/* 3D Carousel */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${mouseY * 0.3}deg)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          {duplicatedWinners.map((winner, index) => {
            const style = getCardStyle(index, WINNERS.length);
            const colors = getColorConfig(winner.value);

            return (
              <div
                key={`${winner.id}-${index}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56"
                style={{
                  ...style,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Card with glassmorphism */}
                <div
                  className={`relative p-4 rounded-2xl backdrop-blur-lg border ${colors.border} ${colors.bg} overflow-hidden`}
                  style={{
                    boxShadow: `
                      0 0 40px ${colors.glow},
                      0 20px 60px rgba(0,0,0,0.4),
                      inset 0 1px 0 rgba(255,255,255,0.15)
                    `,
                  }}
                >
                  {/* Floating money icon */}
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                    💰
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-black shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        boxShadow: `0 0 20px ${colors.glow}`,
                      }}
                    >
                      {winner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{winner.name}</p>
                      <p className={`${colors.text} text-xs font-medium`}>{winner.time}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-center mb-3">
                    <p className={`text-2xl font-black ${colors.text} drop-shadow-lg`}>
                      {winner.amount}
                    </p>
                  </div>

                  {/* Pix received badge */}
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                      ✓
                    </span>
                    <span className="text-emerald-400 text-xs font-medium">Pix Recebido</span>
                  </div>

                  {/* Shine effect */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                      transform: `translateX(${-100 + (rotation % 50) * 4}%)`,
                      transition: "transform 0.1s linear",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
      </div>

      {/* Stats footer */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-500">
        <span>Total de prêmios hoje:</span>
        <span className="text-emerald-400 font-bold text-lg">{WINNERS.length * 15}</span>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

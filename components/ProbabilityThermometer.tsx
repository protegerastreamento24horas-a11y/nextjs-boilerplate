"use client";

import { useState, useEffect } from "react";

interface ProbabilityThermometerProps {
  minProbability?: number;
  maxProbability?: number;
  compact?: boolean;
}

export function ProbabilityThermometer({ 
  minProbability = 90, 
  maxProbability = 98,
  compact = false
}: ProbabilityThermometerProps) {
  const [probability, setProbability] = useState(minProbability);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Gera valor aleatório entre min e max
    const randomProb = Math.floor(Math.random() * (maxProbability - minProbability + 1)) + minProbability;
    setProbability(randomProb);
    
    // Após animação inicial, para de animar
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [minProbability, maxProbability]);

  return (
    <div className={`w-full ${compact ? 'mb-2' : 'mb-4'}`}>
      {/* Label */}
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
            Probabilidade
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
            ALTA
          </span>
        </div>
      )}

      {/* Termômetro 3D Container */}
      <div 
        className={`relative rounded-xl overflow-hidden ${compact ? 'h-10' : ''}`}
        style={{
          background: "linear-gradient(135deg, rgba(20,20,25,0.95) 0%, rgba(35,35,40,0.9) 100%)",
          border: "2px solid rgba(34,197,94,0.5)",
          boxShadow: `
            0 0 30px rgba(34,197,94,0.3),
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 10px 40px rgba(0,0,0,0.5)
          `,
          transform: compact ? "none" : "perspective(800px) rotateX(5deg)",
          transformOrigin: "center bottom",
        }}
      >
        {/* Glass tube effect */}
        <div 
          className={`relative px-3 flex items-center ${compact ? 'h-10' : 'h-14'}`}
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
          }}
        >
          {/* Glass shine */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)",
            }}
          />

          {/* Liquid fill container */}
          <div className="flex-1 relative h-6 rounded-full overflow-hidden bg-zinc-800/50">
            {/* Background track */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(180deg, rgba(40,40,45,0.8) 0%, rgba(30,30,35,0.9) 100%)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
              }}
            />

            {/* Animated neon green liquid */}
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-[2000ms] ease-out"
              style={{
                width: `${probability}%`,
                background: `
                  linear-gradient(90deg, 
                    #10B981 0%, 
                    #22C55E 25%, 
                    #4ADE80 50%, 
                    #22C55E 75%, 
                    #10B981 100%
                  )
                `,
                boxShadow: `
                  0 0 30px rgba(34,197,94,0.8),
                  0 0 60px rgba(34,197,94,0.5),
                  inset 0 1px 0 rgba(255,255,255,0.4)
                `,
              }}
            >
              {/* Shine on liquid */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
                }}
              />

              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/60"
                    style={{
                      left: `${20 + i * 15}%`,
                      animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>

              {/* Animated shine moving across */}
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              />
            </div>

            {/* Glass reflection overlay */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 80%, rgba(255,255,255,0.05) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            />
          </div>

          {/* Percentage display */}
          <div className={`flex-shrink-0 ${compact ? 'ml-2' : 'ml-3'}`}>
            <span 
              className={`font-black ${compact ? 'text-lg' : 'text-2xl'}`}
              style={{
                background: "linear-gradient(135deg, #22C55E 0%, #4ADE80 50%, #22C55E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(34,197,94,0.6)",
              }}
            >
              {probability}%
            </span>
          </div>
        </div>

        {/* Pulsing glow effect */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: "2px solid rgba(34,197,94,0.4)",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Bottom text */}
      {!compact && (
        <div className="text-center mt-1">
          <span className="text-[10px] text-zinc-500">
            Chance de ganho em cada raspadinha
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
          50% { transform: translateY(-8px) translateX(3px); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(34,197,94,0.3), inset 0 0 20px rgba(34,197,94,0.2);
          }
          50% { 
            box-shadow: 0 0 50px rgba(34,197,94,0.6), inset 0 0 30px rgba(34,197,94,0.3);
          }
        }
      `}</style>
    </div>
  );
}

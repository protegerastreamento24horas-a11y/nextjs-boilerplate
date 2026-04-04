"use client";

import { useState, useEffect, useCallback } from "react";

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
  const [targetProbability, setTargetProbability] = useState(minProbability);
  const [displayProbability, setDisplayProbability] = useState(minProbability);
  const [isSpinning, setIsSpinning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    minutes: Math.floor(Math.random() * 5) + 2,
    seconds: Math.floor(Math.random() * 60)
  });

  // Generate target probability
  useEffect(() => {
    const randomProb = Math.floor(Math.random() * (maxProbability - minProbability + 1)) + minProbability;
    setTargetProbability(randomProb);
  }, [minProbability, maxProbability]);

  // Slot machine effect
  useEffect(() => {
    if (!isSpinning) return;

    let count = 0;
    const maxSpins = 25;
    const interval = setInterval(() => {
      count++;
      if (count >= maxSpins) {
        clearInterval(interval);
        setDisplayProbability(targetProbability);
        setIsSpinning(false);
      } else {
        // Random numbers during spin
        setDisplayProbability(Math.floor(Math.random() * (maxProbability - minProbability + 1)) + minProbability);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [targetProbability, isSpinning, minProbability, maxProbability]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        // Reset when reaches 0
        return { minutes: Math.floor(Math.random() * 5) + 2, seconds: Math.floor(Math.random() * 60) };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isHighProbability = displayProbability >= 97;
  const isTopTier = displayProbability === 98;

  const formatTime = useCallback((val: number) => val.toString().padStart(2, '0'), []);

  return (
    <div 
      className={`w-full ${compact ? 'mb-2' : 'mb-4'}`}
      onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
      onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
      style={{ position: 'relative' }}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50 px-3 py-2 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(20,20,25,0.98) 0%, rgba(34,197,94,0.2) 100%)",
            border: "1px solid rgba(34,197,94,0.4)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(34,197,94,0.3)",
            animation: "tooltip-fade 0.3s ease-out"
          }}
        >
          <span className="flex items-center gap-1">
            <span className="text-emerald-400">🎯</span>
            Esta é sua chance de ganhar em cada raspadinha!
          </span>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-900 border-r border-b border-emerald-500/40" />
        </div>
      )}
      {/* Label */}
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Probabilidade
            </span>
            {isTopTier && (
              <span 
                className="text-[10px] font-bold text-black px-2 py-0.5 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  boxShadow: "0 0 10px rgba(255,215,0,0.5)",
                  animation: "badge-pulse 1.5s ease-in-out infinite"
                }}
              >
                TOP 1%
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
            {isHighProbability ? 'EXCELENTE' : 'ALTA'}
          </span>
        </div>
      )}

      {/* Termômetro 3D Container with Glass Effect */}
      <div 
        className={`relative rounded-xl overflow-hidden ${compact ? 'h-10' : ''}`}
        style={{
          background: "linear-gradient(135deg, rgba(20,20,25,0.95) 0%, rgba(35,35,40,0.9) 100%)",
          border: `2px solid ${isHovered ? 'rgba(34,197,94,0.8)' : 'rgba(34,197,94,0.5)'}`,
          boxShadow: isHovered 
            ? `0 0 50px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.15), 0 15px 50px rgba(0,0,0,0.5)`
            : `0 0 30px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.5)`,
          transform: compact ? "none" : "perspective(800px) rotateX(5deg)",
          transformOrigin: "center bottom",
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Glass distortion overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(1px)",
          }}
        />
        {/* Glass tube effect */}
        <div 
          className={`relative px-3 flex items-center ${compact ? 'h-10' : 'h-14'}`}
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
          }}
        >
          {/* Glass shine - dynamic */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(${120 + (displayProbability * 0.5)}deg, rgba(255,255,255,0.2) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)`,
              transition: "background 0.5s ease",
            }}
          />

          {/* Liquid fill container */}
          <div className="flex-1 relative h-5 rounded-full overflow-hidden bg-zinc-800/50">
            {/* Background track */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(180deg, rgba(40,40,45,0.8) 0%, rgba(30,30,35,0.9) 100%)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
              }}
            />

            {/* Milestone markers */}
            {[90, 95, 98].map((mark) => (
              <div
                key={mark}
                className="absolute top-0 h-full w-0.5 bg-zinc-600/50"
                style={{ left: `${mark}%` }}
              />
            ))}

            {/* Animated neon green liquid */}
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-[2000ms] ease-out"
              style={{
                width: `${displayProbability}%`,
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

              {/* Bubbles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${4 + i}px`,
                      height: `${4 + i}px`,
                      left: `${10 + i * 15}%`,
                      bottom: "-100%",
                      background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
                      animation: `bubble ${2 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>

              {/* Animated shine moving across */}
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  animation: "shimmer 2s ease-in-out infinite",
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

          {/* Percentage display with pulse effect */}
          <div className={`flex-shrink-0 ${compact ? 'ml-2' : 'ml-3'}`}>
            <span 
              className={`font-black ${compact ? 'text-lg' : 'text-2xl'} ${isHighProbability && !isSpinning ? 'probability-pulse' : ''}`}
              style={{
                background: "linear-gradient(135deg, #22C55E 0%, #4ADE80 50%, #22C55E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isHighProbability 
                  ? "0 0 30px rgba(34,197,94,0.8), 0 0 60px rgba(34,197,94,0.4)"
                  : "0 0 20px rgba(34,197,94,0.6)",
                transition: "all 0.3s ease",
              }}
            >
              {displayProbability}%
            </span>
          </div>
        </div>

        {/* Pulsing glow effect */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: `2px solid ${isHovered ? 'rgba(34,197,94,0.7)' : 'rgba(34,197,94,0.4)'}`,
            animation: isHighProbability ? "pulse-glow-intense 1.5s ease-in-out infinite" : "pulse-glow 2s ease-in-out infinite",
            transition: "border-color 0.3s ease",
          }}
        />
      </div>

      {/* Bottom info section */}
      {!compact && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-zinc-500">
            Maior que 95% das raspadinhas online
          </span>
          <div 
            className="flex items-center gap-1 text-[10px] font-medium"
            style={{
              color: timeLeft.minutes < 2 ? "#F87171" : "#22C55E",
              transition: "color 0.3s ease"
            }}
          >
            <span className="animate-pulse">⏱️</span>
            <span>Expira em: {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}</span>
          </div>
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
        
        @keyframes pulse-glow-intense {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(34,197,94,0.5), inset 0 0 30px rgba(34,197,94,0.3);
          }
          50% { 
            box-shadow: 0 0 70px rgba(34,197,94,0.8), inset 0 0 50px rgba(34,197,94,0.5);
          }
        }

        @keyframes badge-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 10px rgba(255,215,0,0.5);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(255,215,0,0.8);
          }
        }

        @keyframes bubble {
          0% { 
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.6;
          }
          100% { 
            transform: translateY(-25px) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes tooltip-fade {
          from {
            opacity: 0;
            transform: translate(-50%, 5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .probability-pulse {
          animation: number-pulse 2s ease-in-out infinite;
        }

        @keyframes number-pulse {
          0%, 100% { 
            filter: brightness(1);
          }
          50% { 
            filter: brightness(1.3);
          }
        }
      `}</style>
    </div>
  );
}

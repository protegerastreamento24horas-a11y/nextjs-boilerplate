"use client";

import { useState, useEffect } from "react";

interface PlayerCounterProps {
  baseCount?: number;
}

export default function PlayerCounter({ baseCount = 1000 }: PlayerCounterProps) {
  const [count, setCount] = useState(baseCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate random player count changes
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 50) - 20; // -20 to +30
      setCount((prev: number) => {
        const newCount = prev + change;
        return newCount > 500 ? newCount : 500; // Minimum 500 players
      });
      
      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString("pt-BR");
  };

  return (
    <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-1.5 backdrop-blur-sm">
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      
      {/* Count with animation */}
      <span 
        className={`text-emerald-400 font-bold text-sm transition-transform duration-300 ${
          isAnimating ? "scale-110" : "scale-100"
        }`}
      >
        {formatNumber(count)}
      </span>
      
      {/* Label */}
      <span className="text-emerald-300/80 text-xs font-medium">
        {count === 1 ? "pessoa jogando" : "pessoas jogando agora"}
      </span>
      
      {/* Live indicator */}
      <span className="text-[10px] text-emerald-500/60 font-medium uppercase tracking-wider ml-1">
        LIVE
      </span>
    </div>
  );
}

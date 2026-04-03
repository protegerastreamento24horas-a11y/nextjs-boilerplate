"use client";

import { useState, useEffect } from "react";

export function FakeLiveCounter() {
  const [count, setCount] = useState(42);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 3 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 3000);
    
    // Update count every 5-15 seconds with random fluctuation
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.random() > 0.5 
          ? Math.floor(Math.random() * 5) + 1  // +1 to +5
          : -(Math.floor(Math.random() * 3) + 1); // -1 to -3
        const newCount = prev + change;
        return Math.max(15, Math.min(99, newCount)); // Keep between 15-99
      });
    }, Math.random() * 10000 + 5000); // Random interval 5-15s

    return () => {
      clearTimeout(showTimer);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-40 rounded-2xl p-4 flex items-center gap-3"
      style={{
        background: "linear-gradient(135deg, rgba(24,24,27,0.95) 0%, rgba(39,39,42,0.9) 100%)",
        border: "1px solid rgba(255,215,0,0.3)",
        boxShadow: `
          0 0 30px rgba(255,215,0,0.15),
          0 10px 40px rgba(0,0,0,0.5),
          0 20px 60px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,0.1)
        `,
        transform: "perspective(1000px) rotateX(5deg)",
        transformOrigin: "center bottom",
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-40"
        style={{
          background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 50%, rgba(255,165,0,0.1) 100%)",
        }}
      />

      {/* Live indicator with 3D effect */}
      <div 
        className="relative flex items-center justify-center w-10 h-10 rounded-full"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          boxShadow: "0 4px 15px rgba(16,185,129,0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
          transform: "translateZ(10px)",
        }}
      >
        {/* Pulse animation */}
        <span className="absolute -inset-1 rounded-full animate-ping bg-green-400 opacity-40" style={{ animationDuration: "2s" }}></span>
        <span className="relative w-3 h-3 rounded-full bg-white"></span>
      </div>

      {/* Counter content */}
      <div className="relative flex flex-col" style={{ transform: "translateZ(5px)" }}>
        <div className="flex items-baseline gap-1">
          <span 
            className="text-2xl font-black"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 20px rgba(255,215,0,0.3)",
            }}
          >
            {count}
          </span>
          <span className="text-xs text-zinc-400">pessoas</span>
        </div>
        <span className="text-xs text-emerald-400 font-semibold">jogando agora</span>
      </div>

      {/* Shine effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
          animation: "shine 3s ease-in-out infinite",
        }}
      />

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

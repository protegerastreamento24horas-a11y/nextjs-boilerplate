"use client";

import { useState, useEffect } from "react";

export function Countdown3D() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    // Set target time to tomorrow at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const targetTime = tomorrow.getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          hours,
          minutes,
          seconds,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const padNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div 
      className="w-full rounded-xl py-2 px-3 mb-4 relative overflow-hidden flex items-center justify-between"
      style={{
        background: "linear-gradient(135deg, rgba(24,24,27,0.95) 0%, rgba(39,39,42,0.9) 100%)",
        border: "1px solid rgba(255,107,107,0.4)",
        boxShadow: `
          0 0 20px rgba(255,107,107,0.15),
          0 4px 15px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,0.1)
        `,
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,107,107,0.15) 0%, transparent 50%, rgba(255,165,0,0.1) 100%)",
        }}
      />

      {/* Left - Title */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Termina em</span>
      </div>

      {/* Center - Countdown digits */}
      <div className="flex items-center gap-1 relative z-10">
        {/* Hours */}
        <div className="flex items-baseline gap-0.5">
          <span 
            className="text-xl font-black"
            style={{
              background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {padNumber(timeLeft.hours)}
          </span>
          <span className="text-[8px] text-zinc-500">h</span>
        </div>

        {/* Separator */}
        <span 
          className="text-lg font-bold"
          style={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          :
        </span>

        {/* Minutes */}
        <div className="flex items-baseline gap-0.5">
          <span 
            className="text-xl font-black"
            style={{
              background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {padNumber(timeLeft.minutes)}
          </span>
          <span className="text-[8px] text-zinc-500">m</span>
        </div>

        {/* Separator */}
        <span 
          className="text-lg font-bold"
          style={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          :
        </span>

        {/* Seconds */}
        <div className="flex items-baseline gap-0.5">
          <span 
            className="text-xl font-black"
            style={{
              background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {padNumber(timeLeft.seconds)}
          </span>
          <span className="text-[8px] text-zinc-500">s</span>
        </div>
      </div>

      {/* Right - Urgency */}
      <div className="relative z-10">
        <span className="text-[10px] text-red-400 font-semibold animate-pulse">
          🔥 Acabando
        </span>
      </div>

      {/* Shine effect */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
          animation: "shine 4s ease-in-out infinite",
        }}
      />

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

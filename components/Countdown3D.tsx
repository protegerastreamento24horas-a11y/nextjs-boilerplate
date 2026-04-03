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
      className="w-full rounded-2xl p-5 mb-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(24,24,27,0.95) 0%, rgba(39,39,42,0.9) 100%)",
        border: "1px solid rgba(255,107,107,0.4)",
        boxShadow: `
          0 0 40px rgba(255,107,107,0.2),
          0 15px 50px rgba(0,0,0,0.5),
          inset 0 1px 0 rgba(255,255,255,0.1)
        `,
        transform: "perspective(1000px) rotateX(3deg)",
        transformOrigin: "center top",
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,107,107,0.2) 0%, transparent 50%, rgba(255,165,0,0.1) 100%)",
        }}
      />

      {/* Title */}
      <div className="text-center mb-4 relative" style={{ transform: "translateZ(10px)" }}>
        <span className="text-xs text-zinc-400 uppercase tracking-wider">Tempo restante para o sorteio</span>
      </div>

      {/* Countdown digits */}
      <div className="flex justify-center items-center gap-3 relative" style={{ transform: "translateZ(15px)" }}>
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div 
            className="relative px-4 py-3 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(255,165,0,0.1) 100%)",
              border: "1px solid rgba(255,107,107,0.3)",
              boxShadow: "0 4px 15px rgba(255,107,107,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <span 
              className="text-3xl md:text-4xl font-black"
              style={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(255,107,107,0.4)",
              }}
            >
              {padNumber(timeLeft.hours)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">horas</span>
        </div>

        {/* Separator */}
        <span 
          className="text-2xl font-bold self-start mt-2"
          style={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          :
        </span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div 
            className="relative px-4 py-3 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(255,165,0,0.1) 100%)",
              border: "1px solid rgba(255,107,107,0.3)",
              boxShadow: "0 4px 15px rgba(255,107,107,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <span 
              className="text-3xl md:text-4xl font-black"
              style={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(255,107,107,0.4)",
              }}
            >
              {padNumber(timeLeft.minutes)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">minutos</span>
        </div>

        {/* Separator */}
        <span 
          className="text-2xl font-bold self-start mt-2"
          style={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          :
        </span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div 
            className="relative px-4 py-3 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(255,165,0,0.1) 100%)",
              border: "1px solid rgba(255,107,107,0.3)",
              boxShadow: "0 4px 15px rgba(255,107,107,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <span 
              className="text-3xl md:text-4xl font-black"
              style={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(255,107,107,0.4)",
              }}
            >
              {padNumber(timeLeft.seconds)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">segundos</span>
        </div>
      </div>

      {/* Urgency text */}
      <div className="text-center mt-3 relative" style={{ transform: "translateZ(5px)" }}>
        <span className="text-xs text-red-400 font-semibold animate-pulse">
          Corra! As raspadinhas estão acabando 🔥
        </span>
      </div>

      {/* Shine effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
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

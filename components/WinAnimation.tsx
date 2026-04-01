"use client";

import { useEffect, useState } from "react";

interface WinAnimationProps {
  active: boolean;
}

export default function WinAnimation({ active }: WinAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (active && !isVisible) {
      setIsVisible(true);
      // Entrance animation
      setTimeout(() => {
        setScale(1);
        setOpacity(1);
      }, 100);
      
      // Exit animation after 4 seconds
      const exitTimer = setTimeout(() => {
        setScale(0);
        setOpacity(0);
        setTimeout(() => setIsVisible(false), 500);
      }, 4000);
      
      return () => clearTimeout(exitTimer);
    }
  }, [active, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500"
        style={{ opacity: opacity }}
      />
      
      {/* Win message container */}
      <div 
        className="relative transition-all duration-700 ease-out"
        style={{ 
          transform: `scale(${scale})`,
          opacity: opacity 
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-3xl blur-3xl opacity-50 animate-pulse" />
        
        {/* Main card */}
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-2 border-yellow-500/50 rounded-3xl px-12 py-8 shadow-2xl">
          {/* Trophy emoji */}
          <div className="text-6xl mb-4 text-center animate-bounce">
            🏆
          </div>
          
          {/* YOU WIN text */}
          <h1 className="text-5xl md:text-7xl font-black text-center mb-2">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent">
              YOU WIN!
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-yellow-400/80 text-lg md:text-xl text-center font-bold">
            Parabéns! Você ganhou!
          </p>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 text-3xl animate-pulse">✨</div>
          <div className="absolute -top-4 -right-4 text-3xl animate-pulse delay-100">✨</div>
          <div className="absolute -bottom-4 -left-4 text-3xl animate-pulse delay-200">✨</div>
          <div className="absolute -bottom-4 -right-4 text-3xl animate-pulse delay-300">✨</div>
        </div>
      </div>
    </div>
  );
}

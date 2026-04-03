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
    <div className="fixed bottom-4 left-4 z-40 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="text-sm text-zinc-300">
        <span className="text-green-400 font-bold">{count}</span> pessoas jogando agora
      </span>
    </div>
  );
}

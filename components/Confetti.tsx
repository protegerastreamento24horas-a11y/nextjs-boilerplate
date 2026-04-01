"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  gravity: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const COLORS = [
  "#FFD700", // Gold
  "#FFA500", // Orange
  "#FF6B35", // Deep Orange
  "#F7C600", // Yellow Gold
  "#FFF8DC", // Cornsilk
  "#FFE4B5", // Moccasin
];

export default function Confetti({ active, duration = 5000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active && !isVisible) {
      setIsVisible(true);
      createExplosion();
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [active, duration, isVisible]);

  function createExplosion() {
    const newParticles: Particle[] = [];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = Math.random() * 15 + 5;
      
      newParticles.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5,
        speedX: Math.cos(angle) * velocity,
        speedY: Math.sin(angle) * velocity - Math.random() * 10,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
        gravity: 0.3 + Math.random() * 0.2,
      });
    }
    
    setParticles(newParticles);
  }

  useEffect(() => {
    if (particles.length === 0) return;

    let animationId: number;
    
    const animate = () => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        
        return prev
          .map((p: Particle) => ({
            ...p,
            x: p.x + p.speedX,
            y: p.y + p.speedY,
            speedY: p.speedY + p.gravity,
            rotation: p.rotation + p.rotationSpeed,
            opacity: p.opacity - 0.005,
          }))
          .filter((p: Particle) => p.opacity > 0 && p.y < window.innerHeight + 100);
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [particles.length]);

  if (!isVisible || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p: Particle) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            borderRadius: "2px",
            boxShadow: `0 0 ${p.size / 2}px ${p.color}40`,
          }}
        />
      ))}
    </div>
  );
}

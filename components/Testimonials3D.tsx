"use client";

import { useEffect, useRef, useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  amount: string;
}

const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: "Maria Julia", text: "Acreditei, raspei e ganhei!", rating: 5, amount: "R$ 500" },
  { id: 2, name: "Cristian R.", text: "R$ 1.500 no Pix em 2 min", rating: 5, amount: "R$ 1.500" },
  { id: 3, name: "João P.", text: "Pensei que era mentira...", rating: 5, amount: "R$ 1.000" },
  { id: 4, name: "Ana L.", text: "Já ganhei 3 vezes!", rating: 5, amount: "R$ 2.000" },
  { id: 5, name: "Pedro M.", text: "Pagamento instantâneo", rating: 5, amount: "R$ 500" },
  { id: 6, name: "Luiza A.", text: "Melhor site, recomendo!", rating: 5, amount: "R$ 3.000" },
];

export default function Testimonials3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  // Auto rotation animation
  useEffect(() => {
    let lastTime = 0;
    const speed = 0.3; // degrees per frame

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 16) { // ~60fps
        setRotation((prev) => (prev + speed) % 360);
        lastTime = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Mouse parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    
    setMousePosition({ x: x * 10, y: y * 10 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Calculate position for each card in 3D circle
  const getCardStyle = (index: number, total: number): React.CSSProperties => {
    const angle = (index * (360 / total) + rotation) * (Math.PI / 180);
    const radius = 280; // radius of the circle
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    const rotateY = index * (360 / total) + rotation;
    const scale = (z + radius) / (radius * 2) * 0.4 + 0.6; // scale based on depth
    const opacity = (z + radius) / (radius * 2) * 0.5 + 0.5;
    
    return {
      transform: `
        translateX(${x}px) 
        translateZ(${z}px) 
        rotateY(${rotateY}deg)
        scale(${scale})
      `,
      opacity,
      zIndex: Math.round(z + radius),
    };
  };

  // Duplicate for seamless loop
  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div 
      ref={containerRef}
      className="w-full h-48 overflow-hidden relative"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950" />
      
      {/* Light rays effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,215,0,0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
            transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
      </div>

      {/* Floating particles - pre-calculated positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
          const positions = [
            { left: 15, top: 25, opacity: 0.4, delay: 0.5, duration: 2.3 },
            { left: 85, top: 15, opacity: 0.6, delay: 1.2, duration: 2.8 },
            { left: 45, top: 75, opacity: 0.3, delay: 0.8, duration: 2.1 },
            { left: 70, top: 45, opacity: 0.5, delay: 1.5, duration: 2.5 },
            { left: 25, top: 60, opacity: 0.4, delay: 2.1, duration: 2.7 },
            { left: 90, top: 80, opacity: 0.6, delay: 0.3, duration: 2.4 },
            { left: 5, top: 40, opacity: 0.3, delay: 1.8, duration: 2.2 },
            { left: 55, top: 10, opacity: 0.5, delay: 0.9, duration: 2.6 },
            { left: 35, top: 85, opacity: 0.4, delay: 2.5, duration: 2.9 },
            { left: 80, top: 30, opacity: 0.6, delay: 1.1, duration: 2.3 },
            { left: 10, top: 70, opacity: 0.3, delay: 1.6, duration: 2.5 },
            { left: 60, top: 55, opacity: 0.5, delay: 0.7, duration: 2.1 },
          ];
          const pos = positions[i];
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                opacity: pos.opacity,
                animationDelay: `${pos.delay}s`,
                animationDuration: `${pos.duration}s`,
              }}
            />
          );
        })}
      </div>

      {/* Title */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider drop-shadow-lg">
          Depoimentos de Ganhadores
        </h3>
      </div>

      {/* 3D Carousel Container */}
      <div 
        ref={cardsRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => {
          const style = getCardStyle(index, TESTIMONIALS.length);
          
          return (
            <div
              key={`${testimonial.id}-${index}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48"
              style={{
                ...style,
                transformStyle: "preserve-3d",
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Card */}
              <div 
                className="relative p-4 rounded-2xl backdrop-blur-md border border-yellow-500/30"
                style={{
                  background: "linear-gradient(135deg, rgba(24,24,27,0.9) 0%, rgba(39,39,42,0.8) 100%)",
                  boxShadow: `
                    0 0 30px rgba(255,215,0,0.15),
                    0 10px 40px rgba(0,0,0,0.5),
                    inset 0 1px 0 rgba(255,255,255,0.1)
                  `,
                }}
              >
                {/* Glow effect on front */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 50%, rgba(255,165,0,0.1) 100%)",
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Avatar with glow */}
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
                      style={{
                        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        boxShadow: "0 0 15px rgba(255,215,0,0.5)",
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">{testimonial.name}</p>
                      <p className="text-yellow-400 text-[10px] font-bold">{testimonial.amount}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs drop-shadow">
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-zinc-300 text-[10px] leading-tight italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Verified badge */}
                  <div className="mt-2 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[8px]">
                      ✓
                    </span>
                    <span className="text-emerald-400 text-[8px]">Verificado</span>
                  </div>
                </div>

                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
                    transform: `translateX(${-100 + (rotation % 100) * 2}%)`,
                    transition: "transform 0.1s linear",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: "Carlos S.", text: "Acreditei, raspei e ganhei!", rating: 5 },
  { id: 2, name: "Maria J.", text: "R$ 500 no Pix em 2 minutos", rating: 5 },
  { id: 3, name: "João P.", text: "Pensei que era mentira, mas recebi!", rating: 5 },
  { id: 4, name: "Ana L.", text: "Já ganhei 3 vezes, top demais!", rating: 5 },
  { id: 5, name: "Pedro M.", text: "Pagamento instantâneo", rating: 5 },
  { id: 6, name: "Luiza A.", text: "Melhor site de raspadinha", rating: 5 },
];

export default function TestimonialsMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const speed = 0.8; // pixels per frame (fast)

    const animate = () => {
      positionRef.current += speed;

      // Get the width of one set of items
      const contentWidth = container.scrollWidth / 2;

      // Reset when we've scrolled through half the content
      if (positionRef.current >= contentWidth) {
        positionRef.current = 0;
      }

      container.style.transform = `translateX(-${positionRef.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="w-full overflow-hidden bg-zinc-900/50 border-y border-yellow-500/20">
      <div
        ref={scrollRef}
        className="flex items-center gap-6 py-2 whitespace-nowrap"
        style={{ width: "fit-content" }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={`${testimonial.id}-${index}`}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/40 border border-zinc-700/50 shrink-0"
          >
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
              {testimonial.name.charAt(0)}
            </div>

            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">
                  ★
                </span>
              ))}
            </div>

            {/* Text */}
            <span className="text-zinc-300 text-sm font-medium">
              &ldquo;{testimonial.text}&rdquo;
            </span>

            {/* Name */}
            <span className="text-zinc-500 text-xs">- {testimonial.name}</span>

            {/* Verified Badge */}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              ✓
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

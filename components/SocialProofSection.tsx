"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  city: string;
  prize: string;
  image: string;
  quote: string;
  timeAgo: string;
}

interface PixProof {
  id: number;
  amount: string;
  timeAgo: string;
  winnerName: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Carlos Silva",
    city: "São Paulo, SP",
    prize: "Caixa Heineken",
    image: "/images/social-proof/b_amigos_joves_brasile.png",
    quote: "Ganhei uma caixa de Heineken em minutos! Pagamento via PIX super rápido!",
    timeAgo: "2 minutos atrás",
  },
  {
    id: 2,
    name: "Mariana Costa",
    city: "Rio de Janeiro, RJ",
    prize: "Caixa Corona",
    image: "/images/social-proof/b_amigos_joves_sentado.jpeg",
    quote: "Não acreditei quando vi que tinha ganhado! Raspadinha da Sorte é top!",
    timeAgo: "5 minutos atrás",
  },
  {
    id: 3,
    name: "João Pedro",
    city: "Belo Horizonte, MG",
    prize: "Caixa Stella Artois",
    image: "/images/social-proof/flux-2-flex-20260129_b_amigos_joves_brasile.jpeg",
    quote: "Minha primeira vez jogando e já ganhei! Indicando pra todos meus amigos!",
    timeAgo: "12 minutos atrás",
  },
  {
    id: 4,
    name: "Ana Luiza",
    city: "Curitiba, PR",
    prize: "Caixa Heineken",
    image: "/images/social-proof/grok-imagine-image-pro-20260306_b_amigos_joves_brasile.jpeg",
    quote: "Rápido, fácil e confiável! Já ganhei 2 vezes essa semana!",
    timeAgo: "18 minutos atrás",
  },
];

const PIX_PROOFS: PixProof[] = [
  { id: 1, amount: "R$ 5,00", timeAgo: "Agora mesmo", winnerName: "Carlos S." },
  { id: 2, amount: "R$ 12,00", timeAgo: "2 min atrás", winnerName: "Mariana C." },
  { id: 3, amount: "R$ 5,00", timeAgo: "5 min atrás", winnerName: "João P." },
  { id: 4, amount: "R$ 20,00", timeAgo: "8 min atrás", winnerName: "Ana L." },
  { id: 5, amount: "R$ 12,00", timeAgo: "12 min atrás", winnerName: "Pedro M." },
];

const BADGES = [
  { icon: "✓", text: "Pagamento Real", color: "from-emerald-500 to-emerald-600" },
  { icon: "★", text: "Ganhadores Reais", color: "from-yellow-500 to-yellow-600" },
  { icon: "⚡", text: "Saque Imediato", color: "from-blue-500 to-blue-600" },
];

export default function SocialProofSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [prizeCount, setPrizeCount] = useState(2847);

  useEffect(() => {
    setIsVisible(true);
    
    // Incrementar contador a cada 30 segundos
    const interval = setInterval(() => {
      setPrizeCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="w-full py-12 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-sm font-semibold">Ganhadores em tempo real</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              +{prizeCount.toLocaleString()}
            </span>{" "}
            prêmios entregues
          </h2>
          <p className="text-zinc-400 text-lg">
            Junte-se aos milhares de ganhadores que já levaram cerveja premium para casa!
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {BADGES.map((badge, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 bg-gradient-to-r ${badge.color} text-white px-5 py-2.5 rounded-full shadow-lg transform hover:scale-105 transition-transform cursor-default`}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="font-bold text-sm">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Testimonials Carousel */}
          <div className="relative">
            <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                Depoimentos de Ganhadores
              </h3>

              <div className="relative overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {TESTIMONIALS.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="w-full flex-shrink-0 p-2"
                    >
                      <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                        <div className="flex items-start gap-4">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-yellow-500/50">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white">{testimonial.name}</span>
                              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                ✓ Verificado
                              </span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-2">{testimonial.city}</p>
                            <p className="text-yellow-400 font-semibold text-sm mb-2">
                              🏆 {testimonial.prize}
                            </p>
                            <p className="text-zinc-300 text-sm italic">&ldquo;{testimonial.quote}&rdquo;</p>
                            <p className="text-zinc-500 text-xs mt-2">{testimonial.timeAgo}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-center gap-2 mt-4">
                {TESTIMONIALS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-yellow-400 w-6"
                        : "bg-zinc-600 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={prevSlide}
                  title="Depoimento anterior"
                  className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full text-white transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={nextSlide}
                  title="Próximo depoimento"
                  className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full text-white transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* PIX Proofs */}
          <div className="relative">
            <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-emerald-400">💰</span>
                Comprovantes PIX
              </h3>

              <div className="space-y-3">
                {PIX_PROOFS.map((proof) => (
                  <div
                    key={proof.id}
                    className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <span className="text-emerald-400 text-lg">✓</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{proof.winnerName}</p>
                        <p className="text-zinc-400 text-xs">Pagamento confirmado</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">{proof.amount}</p>
                      <p className="text-zinc-500 text-xs">{proof.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live indicator */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-400">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span>Atualizando em tempo real...</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              const element = document.getElementById("comprar");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 font-bold text-lg rounded-2xl transition-all duration-300 active:scale-[0.98] hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 40%, #D97706 100%)",
              color: "#000",
              boxShadow: "0 12px 40px rgba(245, 158, 11, 0.5), 0 0 0 2px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <span>Jogar Agora</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              AO VIVO
            </div>
          </button>
          <p className="text-zinc-500 text-sm mt-4">
            Mais de 150 pessoas estão jogando agora!
          </p>
        </div>
      </div>
    </section>
  );
}

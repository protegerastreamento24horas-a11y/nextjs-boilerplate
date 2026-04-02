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

const BADGES = [
  { icon: "✓", text: "Pagamento Real", color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/30" },
  { icon: "★", text: "Ganhadores Reais", color: "from-yellow-500 to-yellow-600", shadow: "shadow-yellow-500/30" },
  { icon: "⚡", text: "Saque Imediato", color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/30" },
];

export default function SocialProofSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prizeCount, setPrizeCount] = useState(2847);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
    <section className="w-full py-16 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header with animated counter */}
        <div className={`text-center mb-12 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-full px-5 py-2.5 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-sm font-bold tracking-wide uppercase">Ganhadores em tempo real</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
            <span className="inline-block bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent animate-pulse">
              +{prizeCount.toLocaleString()}
            </span>
            <span className="block md:inline text-2xl md:text-4xl lg:text-5xl md:ml-3 mt-2 md:mt-0">
              prêmios entregues
            </span>
          </h2>
          
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
            Junte-se aos milhares de ganhadores que já levaram cerveja premium para casa!
          </p>
        </div>

        {/* Trust Badges */}
        <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {BADGES.map((badge, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 bg-gradient-to-r ${badge.color} text-white px-6 py-3 rounded-full ${badge.shadow} shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-default`}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="font-bold text-sm md:text-base">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* Photo Gallery Grid */}
        <div className={`mb-12 transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-3xl">📸</span>
            Fotos dos Ganhadores
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-xl transform transition-all duration-500 hover:scale-105 hover:z-10"
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => setSelectedImage(testimonial.image)}
              >
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {hoveredImage === index && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 animate-fade-in">
                    <p className="text-white font-bold text-sm">{testimonial.name}</p>
                    <p className="text-yellow-400 text-xs font-semibold">{testimonial.prize}</p>
                    <p className="text-zinc-300 text-xs mt-1">{testimonial.timeAgo}</p>
                  </div>
                )}

                {/* Winner badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  🏆
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Testimonials */}
        <div className="max-w-2xl mx-auto">
          {/* Testimonials Carousel */}
          <div className={`transition-all duration-700 delay-400 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border border-yellow-500/30 rounded-3xl p-8 backdrop-blur-sm shadow-2xl shadow-yellow-500/10">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-10 h-10 rounded-full flex items-center justify-center text-black text-lg">
                  ★
                </span>
                Depoimentos de Ganhadores
              </h3>

              <div className="relative h-64 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  <div className="flex h-full">
                    {TESTIMONIALS.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="w-full flex-shrink-0 p-2"
                      >
                        <div className="bg-zinc-800/80 rounded-2xl p-6 border border-zinc-700/50 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-yellow-500/50 shadow-lg">
                                <Image
                                  src={testimonial.image}
                                  alt={testimonial.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-lg">{testimonial.name}</span>
                                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    ✓ Verificado
                                  </span>
                                </div>
                                <p className="text-zinc-400 text-sm">{testimonial.city}</p>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500 rounded-r-lg p-3 mb-4">
                              <p className="text-yellow-400 font-bold">{testimonial.prize}</p>
                            </div>
                            
                            <p className="text-zinc-300 text-base italic leading-relaxed">
                              &ldquo;{testimonial.quote}&rdquo;
                            </p>
                          </div>
                          
                          <p className="text-zinc-500 text-sm mt-4">{testimonial.timeAgo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center gap-2 mt-6">
                {TESTIMONIALS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-yellow-400 w-8"
                        : "bg-zinc-600 hover:bg-zinc-500 w-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`mt-16 text-center transition-all duration-700 delay-600 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button
            onClick={() => {
              const element = document.getElementById("comprar");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative inline-flex items-center gap-4 px-12 py-6 font-black text-xl rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 40%, #D97706 100%)",
              color: "#000",
              boxShadow: "0 12px 40px rgba(245, 158, 11, 0.5), 0 0 0 2px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <span>Jogar Agora</span>
            <span className="text-2xl animate-bounce">→</span>
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg animate-pulse">
              🔥 AO VIVO
            </div>
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-4 text-zinc-400">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 border-2 border-zinc-800 flex items-center justify-center text-xs text-white font-bold">
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm">
              <span className="text-white font-bold">+150 pessoas</span> estão jogando agora
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Foto do ganhador"
              width={800}
              height={600}
              className="object-contain max-h-[80vh]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

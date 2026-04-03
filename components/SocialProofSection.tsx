"use client";

import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  image: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Parceiro Premium",
    image: "/images/social-proof/7222d1c16ce25b203d0504ea00db3773.jpg",
  },
  {
    id: 2,
    name: "Capas Janeiro",
    image: "/images/social-proof/CAPAS-JANEIRO-2024-51.png",
  },
  {
    id: 3,
    name: "Pay4Fun",
    image: "/images/social-proof/LOTEP-autoriza-Pay4Fun-e-mais-4-empresas-para-testes-de-sistema-de-pagamentos.jpg",
  },
  {
    id: 4,
    name: "Google Safe",
    image: "/images/social-proof/google-safe-browsing.webp",
  },
];

export default function SocialProofSection() {
  return (
    <section className="w-full py-8 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-4xl mx-auto px-4">
        {/* Título PARCEIROS */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-8">
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            PARCEIROS
          </span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-contain p-2"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

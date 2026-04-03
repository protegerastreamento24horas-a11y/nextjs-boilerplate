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
    name: "Google Safe",
    image: "/images/social-proof/google-safe-browsing.webp",
  },
  {
    id: 2,
    name: "Lotep",
    image: "/images/social-proof/LOTEP-autoriza-Pay4Fun-e-mais-4-empresas-para-testes-de-sistema-de-pagamentos.jpg",
  },
];

export default function SocialProofSection() {
  return (
    <section className="w-full py-8 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-4xl mx-auto px-4">
        {/* Grid de parceiros - sem título, imagens menores */}
        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative h-12 rounded overflow-hidden bg-zinc-800"
            >
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-contain p-1"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

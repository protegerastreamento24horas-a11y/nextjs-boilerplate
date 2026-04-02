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
    name: "Carlos Silva",
    image: "/images/social-proof/b_amigos_joves_brasile.png",
  },
  {
    id: 2,
    name: "Mariana Costa",
    image: "/images/social-proof/b_amigos_joves_sentado.jpeg",
  },
  {
    id: 3,
    name: "João Pedro",
    image: "/images/social-proof/flux-2-flex-20260129_b_amigos_joves_brasile.jpeg",
  },
  {
    id: 4,
    name: "Ana Luiza",
    image: "/images/social-proof/grok-imagine-image-pro-20260306_b_amigos_joves_brasile.jpeg",
  },
];

export default function SocialProofSection() {
  return (
    <section className="w-full py-8 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative aspect-square rounded-2xl overflow-hidden border-4 border-yellow-500/80 shadow-xl shadow-yellow-500/20"
            >
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

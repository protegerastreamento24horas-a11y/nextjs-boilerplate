"use client";

import { useState } from "react";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="w-full py-8 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border-4 border-yellow-500/80 shadow-xl shadow-yellow-500/20"
              onClick={() => setSelectedImage(testimonial.image)}
            >
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
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

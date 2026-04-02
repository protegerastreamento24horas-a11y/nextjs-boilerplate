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
    name: "Parceiro 1",
    image: "/images/social-proof/171b53b49dcdd25a3449eeadf81b95f0.jpg",
  },
  {
    id: 2,
    name: "Ambev",
    image: "/images/social-proof/ambev.jpg",
  },
  {
    id: 3,
    name: "Heineken",
    image: "/images/social-proof/desktop-wallpaper-heineken-logo-beer-green-backgrounds-beer-logo.jpg",
  },
  {
    id: 4,
    name: "Zé Delivery",
    image: "/images/social-proof/ze-delivery-logo-png_seeklogo-621309.png",
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

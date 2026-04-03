"use client";
// Deploy Vercel v2

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import FloatingBeers from "@/components/FloatingBeers";
import RecentWinnersStack from "@/components/RecentWinnersStack";
import PromoPopup from "@/components/PromoPopup";
import SocialProofSection from "@/components/SocialProofSection";
import BannerCarousel from "@/components/BannerCarousel";
import Testimonials3D from "@/components/Testimonials3D";
import { FakeLiveCounter } from "@/components/FakeLiveCounter";

interface Raffle {
  id: string;
  slug: string;
  name: string;
  description: string;
  homeBanner?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  totalParticipants: number;
}

interface SiteConfig {
  mainBannerUrl?: string;
  mainBannerUrl2?: string;
  mainBannerUrl3?: string;
  mainBannerUrl4?: string;
  mainBannerUrl5?: string;
  mainBannerLink?: string;
  mainBannerActive?: boolean;
  popupImageUrl?: string;
  popupLink?: string;
  popupActive?: boolean;
  popupDelay?: number;
}

// Configuração fallback das imagens do banner
const FALLBACK_BANNER_IMAGES: { src: string; alt: string; type?: "video" | "image" }[] = [
  { src: "/images/banner1.jpg", alt: "Raspadinha da Sorte - A sorte está em suas mãos!" },
  { src: "/images/banner2.jpg", alt: "Raspadinha da Sorte - Concorra a prêmios incríveis!" },
  { src: "/images/banner3.jpg", alt: "Raspadinha da Sorte - Heineken, Stella Artois e Corona!" },
];

function LandingPageContent() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rafflesRes, configRes] = await Promise.all([
          fetch("/api/raffles"),
          fetch("/api/admin/site-config"),
        ]);
        
        if (rafflesRes.ok) {
          const rafflesData = await rafflesRes.json();
          console.log("[DEBUG] Raffles recebidos:", rafflesData.map((r: any) => ({ 
            name: r.name, 
            homeBanner: r.homeBanner?.substring(0, 30),
            logoUrl: r.logoUrl?.substring(0, 30)
          })));
          setRaffles(rafflesData);
        }
        
        if (configRes.ok) {
          const configData = await configRes.json();
          console.log("[DEBUG] SiteConfig carregado:", configData);
          setSiteConfig(configData);
        } else {
          console.error("[DEBUG] Erro ao carregar site config:", configRes.status);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // Monta array de banners (dinâmico + fallbacks)
  const customBanners: { src: string; alt: string; type?: "video" | "image" }[] = [];
  
  if (siteConfig?.mainBannerActive) {
    const bannerUrls = [
      siteConfig?.mainBannerUrl,
      siteConfig?.mainBannerUrl2,
      siteConfig?.mainBannerUrl3,
      siteConfig?.mainBannerUrl4,
      siteConfig?.mainBannerUrl5,
    ].filter(Boolean) as string[];
    
    bannerUrls.forEach((url, index) => {
      customBanners.push({ src: url, alt: `Banner ${index + 1}`, type: "image" });
    });
  }
  
  const bannerImages = customBanners.length > 0 ? customBanners : FALLBACK_BANNER_IMAGES;
  
  console.log("[DEBUG] Banner images:", bannerImages);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Pop-up Promocional - configurável via admin */}
      <PromoPopup 
        imageUrl={siteConfig?.popupImageUrl}
        link={siteConfig?.popupLink}
        isActive={siteConfig?.popupActive}
        delay={siteConfig?.popupDelay}
      />

      {/* Contador fake de pessoas jogando */}
      <FakeLiveCounter />

      {/* Floating beer particles background */}
      <FloatingBeers />

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,215,0,0.08) 0%, transparent 70%)",
        }}
      />

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Banner Carousel no topo - Usa banner dinâmico se configurado */}
        <div className="w-full -mt-4 mb-2">
          <BannerCarousel images={bannerImages} autoPlayInterval={6000} />
        </div>

        {/* Testimonials 3D Carousel - Abaixo do banner */}
        <div className="w-full mb-4">
          <Testimonials3D />
        </div>

        {/* Raffle Selection Cards - Estilo Depoimentos */}
        <div className="w-full max-w-5xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Escolha sua Raspadinha</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <button
                key={raffle.id}
                onClick={() => router.push(`/sorteio/${raffle.slug}`)}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, rgba(24,24,27,0.9) 0%, rgba(39,39,42,0.8) 100%)",
                  border: "1px solid rgba(255,215,0,0.3)",
                  boxShadow: "0 0 30px rgba(255,215,0,0.15), 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 50%, rgba(255,165,0,0.1) 100%)",
                  }}
                />

                {/* Banner/Image */}
                <div className="h-48 overflow-hidden relative">
                  {raffle.homeBanner ? (
                    <img
                      src={raffle.homeBanner}
                      alt={raffle.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {raffle.logoUrl ? (
                        <img
                          src={raffle.logoUrl}
                          alt={raffle.name}
                          className="h-24 object-contain"
                        />
                      ) : (
                        <span className="text-6xl">🎁</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6 relative">
                  <h3 className="text-xl font-bold text-white mb-2">{raffle.name}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{raffle.description}</p>
                  
                  {/* CTA Button - Estilo dourado */}
                  <div
                    className="py-3 px-6 rounded-xl font-bold text-black transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      boxShadow: "0 0 15px rgba(255,215,0,0.5)",
                    }}
                  >
                    Raspe aqui
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Selos de segurança */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full">
            <span>Pagamento 100% seguro</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full">
            <span>Resultado instantâneo</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full">
            <span>Sem burocracia</span>
          </div>
        </div>

        {/* Recent Winners Stack - Notificações sequenciais */}
        <div className="mt-10 w-full flex justify-center">
          <RecentWinnersStack />
        </div>

        {/* Social Proof Section */}
        <div className="mt-10 w-full">
          <SocialProofSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center border-t border-zinc-900">
        <div className="text-zinc-700 text-xs">
          Raspadinha da Sorte &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

// Export principal com Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  );
}

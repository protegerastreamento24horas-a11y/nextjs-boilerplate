"use client";
// Deploy Vercel v2

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import FloatingBeers from "@/components/FloatingBeers";
import RecentWinnersTicker from "@/components/RecentWinnersTicker";
import PromoPopup from "@/components/PromoPopup";
import SocialProofSection from "@/components/SocialProofSection";

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

function LandingPageContent() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRaffles() {
      try {
        const res = await fetch("/api/raffles");
        if (res.ok) {
          const data = await res.json();
          setRaffles(data);
        }
      } catch (error) {
        console.error("Erro ao carregar sorteios:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRaffles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Pop-up Promocional - aparece imediatamente */}
      <PromoPopup />

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
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Raspadinha da Sorte
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Escolha um sorteio e participe! Raspe, pague via PIX e descubra na hora se ganhou.
          </p>
        </div>

        {/* Raffle Selection Cards */}
        <div className="w-full max-w-5xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Escolha seu Sorteio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <button
                key={raffle.id}
                onClick={() => router.push(`/sorteio/${raffle.slug}`)}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${raffle.primaryColor} 0%, ${raffle.secondaryColor} 100%)`,
                }}
              >
                {/* Banner/Image */}
                <div className="h-48 overflow-hidden">
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
                <div className="p-6 bg-zinc-900/90 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-2">{raffle.name}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{raffle.description}</p>
                  
                  {/* Stats */}
                  <div className="flex justify-center gap-4 text-sm mb-4">
                    <span className="text-zinc-500">
                      <span className="text-yellow-400 font-bold">{raffle.totalParticipants}</span> participantes
                    </span>
                  </div>
                  
                  {/* CTA Button */}
                  <div
                    className="py-3 px-6 rounded-xl font-bold text-black transition-transform active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${raffle.primaryColor} 0%, ${raffle.secondaryColor} 100%)`,
                    }}
                  >
                    Participar do Sorteio
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

        {/* Recent Winners Ticker - AUTO SCROLLING */}
        <div className="mt-10 w-full flex justify-center">
          <RecentWinnersTicker />
        </div>

        {/* Social Proof Section */}
        <div className="mt-10 w-full">
          <SocialProofSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center border-t border-zinc-900">
        {/* Security Badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-4 px-4">
          {/* Google Safe Browsing */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">Google Safe Browsing</span>
          </div>
          
          {/* SSL Secure */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">SSL 256-bit Secure</span>
          </div>
          
          {/* Verified Payment */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">Pagamento Verificado</span>
          </div>
          
          {/* Trusted Site */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span className="text-zinc-400 text-xs font-medium">Site Confiança 100%</span>
          </div>
        </div>
        
        <div className="text-zinc-700 text-xs">
          Raspadinha da Sorte &copy; {new Date().getFullYear()}
        </div>
      </footer>

      {/* Modal */}
      {showModal && paymentId && (
        <PixModal
          paymentId={paymentId}
          amount={total}
          qrCode={qrCode}
          qrCodeText={qrCodeText}
          onClose={() => setShowModal(false)}
        />
      )}
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

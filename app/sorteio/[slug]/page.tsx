"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PixModal from "@/components/PixModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/components/ToastContext";
import FloatingBeers from "@/components/FloatingBeers";

interface RafflePackage {
  id: number;
  quantity: number;
  price: number;
  label: string;
  popular: boolean;
  save?: number;
}

interface Raffle {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  pageBanner?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  packages: string; // JSON string
  totalParticipants: number;
  totalWinners: number;
}

export default function RafflePage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const slug = params?.slug as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [packages, setPackages] = useState<RafflePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<RafflePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeText, setQrCodeText] = useState<string | null>(null);
  
  // Form states
  const [showCpfForm, setShowCpfForm] = useState(false);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    async function fetchRaffle() {
      try {
        const res = await fetch(`/api/raffles/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/");
            return;
          }
          throw new Error("Erro ao carregar sorteio");
        }
        const data = await res.json();
        setRaffle(data);
        
        // Parse packages JSON
        const parsedPackages = JSON.parse(data.packages);
        setPackages(parsedPackages);
        setSelectedPackage(parsedPackages[0]);
      } catch (error) {
        addToast("Erro ao carregar sorteio. Tente novamente.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchRaffle();
  }, [slug, router, addToast]);

  async function handlePay() {
    if (!selectedPackage || !raffle) return;
    
    if (!showCpfForm) {
      setShowCpfForm(true);
      return;
    }
    
    if (!cpf || cpf.length < 11) {
      addToast("Por favor, digite um CPF válido com 11 dígitos.", "warning");
      return;
    }
    
    if (!whatsapp || whatsapp.length < 11) {
      addToast("Por favor, digite um WhatsApp válido com DDD.", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: selectedPackage.quantity,
          amount: selectedPackage.price,
          cpf,
          name: name || undefined,
          whatsapp: whatsapp || undefined,
          raffleId: raffle.id,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar pagamento");
      }
      
      if (!data.qrCode && !data.pixId) {
        throw new Error("QR Code não gerado. Verifique a configuração do Asaas.");
      }
      
      setPaymentId(data.paymentId);
      setQrCode(data.qrCode || null);
      setQrCodeText(data.qrCodeText || null);
      setShowModal(true);
      setShowCpfForm(false);
    } catch (error: any) {
      addToast(error.message || "Erro ao gerar pagamento. Tente novamente.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!raffle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <FloatingBeers />

      {/* Banner do Sorteio */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        {raffle.pageBanner ? (
          <img
            src={raffle.pageBanner}
            alt={raffle.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${raffle.primaryColor} 0%, ${raffle.secondaryColor} 100%)`,
            }}
          >
            <div className="text-center">
              {raffle.logoUrl && (
                <img
                  src={raffle.logoUrl}
                  alt={raffle.name}
                  className="h-20 md:h-32 mx-auto mb-4"
                />
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                {raffle.name}
              </h1>
            </div>
          </div>
        )}
        
        {/* Overlay com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      <main className="relative flex-1 flex flex-col items-center px-4 py-8 text-center -mt-16">
        {/* Card principal */}
        <div className="w-full max-w-2xl bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Logo e título */}
          <div className="mb-6">
            {!raffle.pageBanner && raffle.logoUrl && (
              <img
                src={raffle.logoUrl}
                alt={raffle.name}
                className="h-16 md:h-24 mx-auto mb-4"
              />
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {raffle.name}
            </h2>
            <p className="text-zinc-400">
              {raffle.description}
            </p>
          </div>

          {/* Estatísticas */}
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {raffle.totalParticipants}
              </div>
              <div className="text-zinc-500">Participantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {raffle.totalWinners}
              </div>
              <div className="text-zinc-500">Ganhadores</div>
            </div>
          </div>

          {/* Descrição completa */}
          {raffle.fullDescription && (
            <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl">
              <p className="text-zinc-300 text-sm leading-relaxed">
                {raffle.fullDescription}
              </p>
            </div>
          )}

          {/* Seleção de pacotes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Escolha seu pacote de raspadinhas
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedPackage?.id === pkg.id
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      POPULAR
                    </div>
                  )}
                  
                  <div className={`text-2xl font-bold mb-1 ${
                    selectedPackage?.id === pkg.id ? "text-yellow-400" : "text-white"
                  }`}>
                    {pkg.quantity}
                  </div>
                  <div className="text-xs text-zinc-500 mb-1">
                    {pkg.quantity === 1 ? "raspadinha" : "raspadinhas"}
                  </div>
                  <div className={`font-bold ${
                    selectedPackage?.id === pkg.id ? "text-yellow-400" : "text-white"
                  }`}>
                    R$ {pkg.price}
                  </div>
                  {pkg.save && (
                    <div className="mt-1 text-[10px] text-green-400">
                      Economize R$ {pkg.save}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Formulário de cadastro ou botão de compra */}
          {showCpfForm ? (
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome (opcional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="000.000.000-00"
                  maxLength={11}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">WhatsApp *</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="(11) 99999-9999"
                  maxLength={11}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              <button
                onClick={handlePay}
                disabled={submitting || cpf.length < 11 || whatsapp.length < 11}
                className="w-full py-4 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: submitting || cpf.length < 11 || whatsapp.length < 11
                    ? "#374151"
                    : `linear-gradient(135deg, ${raffle.primaryColor} 0%, ${raffle.secondaryColor} 100%)`,
                  color: submitting || cpf.length < 11 || whatsapp.length < 11 ? "#9CA3AF" : "#000",
                }}
              >
                {submitting ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  `Pagar R$ ${selectedPackage?.price.toFixed(2).replace(".", ",")}`
                )}
              </button>
              
              <button
                onClick={() => setShowCpfForm(false)}
                className="w-full py-2 text-zinc-500 text-sm hover:text-zinc-400"
              >
                ← Voltar
              </button>
            </div>
          ) : (
            <button
              onClick={handlePay}
              className="w-full py-4 font-bold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${raffle.primaryColor} 0%, ${raffle.secondaryColor} 100%)`,
                color: "#000",
              }}
            >
              {selectedPackage ? (
                `Comprar ${selectedPackage.label} - R$ ${selectedPackage.price.toFixed(2).replace(".", ",")}`
              ) : (
                "Selecione um pacote"
              )}
            </button>
          )}
        </div>

        {/* Botão voltar */}
        <button
          onClick={() => router.push("/")}
          className="mt-6 text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          ← Voltar para página inicial
        </button>
      </main>

      {/* Modal PIX */}
      {showModal && paymentId && (
        <PixModal
          paymentId={paymentId}
          amount={selectedPackage?.price || 0}
          qrCode={qrCode}
          qrCodeText={qrCodeText}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

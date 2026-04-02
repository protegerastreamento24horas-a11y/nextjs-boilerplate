"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Raffle {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  fullDescription: string | null;
  isActive: boolean;
  order: number;
  homeBanner: string | null;
  pageBanner: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  packages: string;
  totalParticipants: number;
  totalWinners: number;
  createdAt: string;
}

interface RafflePackage {
  id: number;
  quantity: number;
  price: number;
  label: string;
  popular: boolean;
  save?: number;
}

export default function RafflesAdminPage() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [formData, setFormData] = useState<Partial<Raffle>>({});
  const [packages, setPackages] = useState<RafflePackage[]>([]);
  const [message, setMessage] = useState("");
  
  // Modal de novo sorteio
  const [showNewRaffleModal, setShowNewRaffleModal] = useState(false);
  const [newRaffleData, setNewRaffleData] = useState<Partial<Raffle>>({
    primaryColor: "#FFD700",
    secondaryColor: "#FFA500",
    isActive: true,
  });
  const [newPackages, setNewPackages] = useState<RafflePackage[]>([
    { id: 1, quantity: 1, price: 5, label: "1 Tentativa", popular: false },
    { id: 2, quantity: 3, price: 12, label: "3 Tentativas", popular: true, save: 3 },
    { id: 3, quantity: 5, price: 20, label: "5 Tentativas", popular: false, save: 5 },
  ]);

  useEffect(() => {
    console.log("[Admin Raffles] Componente montado - v2");
    fetchRaffles();
  }, []);

  async function fetchRaffles() {
    try {
      const res = await fetch("/api/raffles?all=true");
      if (!res.ok) throw new Error("Erro ao carregar sorteios");
      const data = await res.json();
      setRaffles(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }

  function selectRaffle(raffle: Raffle) {
    setSelectedRaffle(raffle);
    setFormData({ ...raffle });
    setPackages(JSON.parse(raffle.packages));
  }

  function updatePackage(index: number, field: keyof RafflePackage, value: any) {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  }

  async function handleSave() {
    if (!selectedRaffle) return;
    
    setSaving(true);
    setMessage("");
    
    try {
      const res = await fetch(`/api/raffles/${selectedRaffle.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          packages,
        }),
      });
      
      if (!res.ok) throw new Error("Erro ao salvar");
      
      setMessage("✅ Sorteio atualizado com sucesso!");
      fetchRaffles();
    } catch (error) {
      setMessage("❌ Erro ao salvar sorteio");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRaffle() {
    if (!newRaffleData.slug || !newRaffleData.name) {
      setMessage("❌ Slug e nome são obrigatórios");
      return;
    }
    
    setSaving(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/admin/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRaffleData,
          packages: newPackages,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar");
      }
      
      setMessage("✅ Sorteio criado com sucesso!");
      setShowNewRaffleModal(false);
      setNewRaffleData({
        primaryColor: "#FFD700",
        secondaryColor: "#FFA500",
        isActive: true,
      });
      fetchRaffles();
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">🎰 Gerenciamento de Sorteios (v2.1)</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewRaffleModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors"
            >
              + Criar Novo Sorteio
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
            >
              ← Voltar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Sorteios */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Sorteios</h2>
              <div className="space-y-2">
                {raffles.map((raffle) => (
                  <button
                    key={raffle.id}
                    onClick={() => selectRaffle(raffle)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedRaffle?.id === raffle.id
                        ? "bg-yellow-500/20 border border-yellow-500/50"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{raffle.name}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          raffle.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {raffle.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-500 mt-1">
                      {raffle.totalParticipants} participantes · {raffle.totalWinners} ganhadores
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor de Sorteio */}
          <div className="lg:col-span-2">
            {selectedRaffle ? (
              <div className="bg-zinc-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Editar: {selectedRaffle.name}
                </h2>

                {message && (
                  <div className="mb-4 p-3 bg-zinc-800 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Nome</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Slug</label>
                      <input
                        type="text"
                        value={selectedRaffle.slug}
                        disabled
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Descrição Curta</label>
                    <input
                      type="text"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Descrição Completa</label>
                    <textarea
                      value={formData.fullDescription || ""}
                      onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  {/* Status e Ordem */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Status</label>
                      <select
                        value={formData.isActive ? "true" : "false"}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Ordem de Exibição</label>
                      <input
                        type="number"
                        value={formData.order || 0}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  {/* Cores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Cor Primária</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor || "#FFD700"}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor || ""}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Cor Secundária</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor || "#FFA500"}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor || ""}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banners e Imagens */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white mb-2">Banners e Imagens</h3>
                    
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Banner da Página Inicial (URL)</label>
                      <input
                        type="text"
                        value={formData.homeBanner || ""}
                        onChange={(e) => setFormData({ ...formData, homeBanner: e.target.value })}
                        placeholder="/images/banner-corona.jpg"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Cole o caminho da imagem (ex: /images/banner-corona.jpg)</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Banner da Página do Sorteio (URL)</label>
                      <input
                        type="text"
                        value={formData.pageBanner || ""}
                        onChange={(e) => setFormData({ ...formData, pageBanner: e.target.value })}
                        placeholder="/images/page-banner-corona.jpg"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Banner grande no topo da página do sorteio</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Logo da Marca (URL)</label>
                      <input
                        type="text"
                        value={formData.logoUrl || ""}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="/images/logo-corona.png"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Logo da marca do sorteio</p>
                    </div>
                  </div>

                  {/* Pacotes */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Pacotes de Raspadinhas</h3>
                    <div className="space-y-3">
                      {packages.map((pkg, index) => (
                        <div key={pkg.id} className="grid grid-cols-5 gap-2 items-center bg-zinc-800/50 p-3 rounded-lg">
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1">Qtd</label>
                            <input
                              type="number"
                              value={pkg.quantity}
                              onChange={(e) => updatePackage(index, "quantity", parseInt(e.target.value))}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1">Preço R$</label>
                            <input
                              type="number"
                              value={pkg.price}
                              onChange={(e) => updatePackage(index, "price", parseInt(e.target.value))}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1">Label</label>
                            <input
                              type="text"
                              value={pkg.label}
                              onChange={(e) => updatePackage(index, "label", e.target.value)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1">Economia R$</label>
                            <input
                              type="number"
                              value={pkg.save || 0}
                              onChange={(e) => updatePackage(index, "save", parseInt(e.target.value) || undefined)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pkg.popular}
                                onChange={(e) => updatePackage(index, "popular", e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-600"
                              />
                              <span className="text-xs text-zinc-400">Popular</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-lg transition-colors"
                    >
                      {saving ? "Salvando..." : "💾 Salvar Alterações"}
                    </button>
                    <button
                      onClick={() => setSelectedRaffle(null)}
                      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h2 className="text-xl font-semibold text-white mb-2">Selecione um Sorteio</h2>
                <p className="text-zinc-500">
                  Clique em um sorteio da lista à esquerda para editar suas configurações.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Novo Sorteio */}
        {showNewRaffleModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-white mb-6">Criar Novo Sorteio</h2>
              
              <div className="space-y-4">
                {/* Slug e Nome */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={newRaffleData.slug || ""}
                      onChange={(e) => setNewRaffleData({ ...newRaffleData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="novo-sorteio"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                    <p className="text-xs text-zinc-500 mt-1">URL única (ex: novo-sorteio)</p>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={newRaffleData.name || ""}
                      onChange={(e) => setNewRaffleData({ ...newRaffleData, name: e.target.value })}
                      placeholder="Nome do Sorteio"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Descrições */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Descrição Curta</label>
                  <input
                    type="text"
                    value={newRaffleData.description || ""}
                    onChange={(e) => setNewRaffleData({ ...newRaffleData, description: e.target.value })}
                    placeholder="Breve descrição do sorteio"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Descrição Completa</label>
                  <textarea
                    value={newRaffleData.fullDescription || ""}
                    onChange={(e) => setNewRaffleData({ ...newRaffleData, fullDescription: e.target.value })}
                    placeholder="Descrição detalhada com regras"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                {/* Banners */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white">Banners</h3>
                  
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Banner Home (URL)</label>
                    <input
                      type="text"
                      value={newRaffleData.homeBanner || ""}
                      onChange={(e) => setNewRaffleData({ ...newRaffleData, homeBanner: e.target.value })}
                      placeholder="/images/banner-novo.jpg"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Banner Página (URL)</label>
                    <input
                      type="text"
                      value={newRaffleData.pageBanner || ""}
                      onChange={(e) => setNewRaffleData({ ...newRaffleData, pageBanner: e.target.value })}
                      placeholder="/images/page-banner-novo.jpg"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Logo (URL)</label>
                    <input
                      type="text"
                      value={newRaffleData.logoUrl || ""}
                      onChange={(e) => setNewRaffleData({ ...newRaffleData, logoUrl: e.target.value })}
                      placeholder="/images/logo-novo.png"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Cores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Cor Primária</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newRaffleData.primaryColor || "#FFD700"}
                        onChange={(e) => setNewRaffleData({ ...newRaffleData, primaryColor: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newRaffleData.primaryColor || ""}
                        onChange={(e) => setNewRaffleData({ ...newRaffleData, primaryColor: e.target.value })}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Cor Secundária</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newRaffleData.secondaryColor || "#FFA500"}
                        onChange={(e) => setNewRaffleData({ ...newRaffleData, secondaryColor: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newRaffleData.secondaryColor || ""}
                        onChange={(e) => setNewRaffleData({ ...newRaffleData, secondaryColor: e.target.value })}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Pacotes */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Pacotes de Raspadinhas</h3>
                  <div className="space-y-2">
                    {newPackages.map((pkg, index) => (
                      <div key={pkg.id} className="grid grid-cols-5 gap-2 items-center bg-zinc-800/50 p-2 rounded-lg">
                        <input
                          type="number"
                          value={pkg.quantity}
                          onChange={(e) => {
                            const updated = [...newPackages];
                            updated[index] = { ...pkg, quantity: parseInt(e.target.value) };
                            setNewPackages(updated);
                          }}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                          placeholder="Qtd"
                        />
                        <input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...newPackages];
                            updated[index] = { ...pkg, price: parseInt(e.target.value) };
                            setNewPackages(updated);
                          }}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                          placeholder="Preço"
                        />
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) => {
                            const updated = [...newPackages];
                            updated[index] = { ...pkg, label: e.target.value };
                            setNewPackages(updated);
                          }}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                          placeholder="Label"
                        />
                        <input
                          type="number"
                          value={pkg.save || 0}
                          onChange={(e) => {
                            const updated = [...newPackages];
                            updated[index] = { ...pkg, save: parseInt(e.target.value) || undefined };
                            setNewPackages(updated);
                          }}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                          placeholder="Economia"
                        />
                        <label className="flex items-center gap-1 cursor-pointer justify-center">
                          <input
                            type="checkbox"
                            checked={pkg.popular}
                            onChange={(e) => {
                              const updated = [...newPackages];
                              updated[index] = { ...pkg, popular: e.target.checked };
                              setNewPackages(updated);
                            }}
                            className="w-4 h-4 rounded border-zinc-600"
                          />
                          <span className="text-xs text-zinc-400">Pop</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateRaffle}
                    disabled={saving}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
                  >
                    {saving ? "Criando..." : "✅ Criar Sorteio"}
                  </button>
                  <button
                    onClick={() => setShowNewRaffleModal(false)}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

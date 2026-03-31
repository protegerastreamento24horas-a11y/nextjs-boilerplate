"use client";

import { useState, useEffect } from "react";
import type { ConfigData } from "@/types";

export default function AdminConfigPage() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d: ConfigData) => {
        setConfig(d);
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);

    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="text-zinc-500 animate-pulse text-sm">
        Carregando configurações...
      </div>
    );
  }
  if (!config) return null;

  const update = (field: keyof ConfigData, value: unknown) =>
    setConfig((c) => (c ? { ...c, [field]: value } : c));

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white">Configurações</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Parâmetros financeiros e modo de operação
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Financial */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            💰 Parâmetros Financeiros
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Preço por tentativa (R$)",
                field: "precoTentativa" as const,
                step: "0.01",
                min: "0.01",
                desc: "Valor cobrado por jogo",
              },
              {
                label: "Custo do prêmio (R$)",
                field: "custoPremio" as const,
                step: "0.01",
                min: "0",
                desc: "Valor do prêmio a pagar",
              },
              {
                label: "Lucro mínimo (R$)",
                field: "lucroMinimo" as const,
                step: "0.01",
                min: "0",
                desc: "Mínimo antes de liberar prêmio",
              },
            ].map((f) => (
              <div key={f.field}>
                <label className="text-zinc-400 text-sm block mb-1">
                  {f.label}
                </label>
                <input
                  type="number"
                  step={f.step}
                  min={f.min}
                  value={config[f.field] as number}
                  onChange={(e) => update(f.field, Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors"
                />
                <p className="text-zinc-700 text-[11px] mt-1">{f.desc}</p>
              </div>
            ))}

            <div>
              <label className="text-zinc-400 text-sm block mb-1">
                Probabilidade base (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={Math.round(config.probabilidade * 100)}
                onChange={(e) =>
                  update("probabilidade", Number(e.target.value) / 100)
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors"
              />
              <p className="text-zinc-700 text-[11px] mt-1">
                Chance de prêmio quando financeiro permite
              </p>
            </div>
          </div>

          {/* Estimated win rate */}
          <div className="mt-5 bg-zinc-800/60 rounded-xl p-4">
            <div className="text-zinc-500 text-xs font-medium mb-1">
              📊 Taxa efetiva de vitória estimada
            </div>
            <div className="text-yellow-400 font-bold">
              ~{((config.probabilidade * 3) / 10 * 100).toFixed(1)}%
            </div>
            <div className="text-zinc-600 text-[11px] mt-0.5">
              probabilidade × (3 revelações / 10 cartelas)
            </div>
          </div>
        </div>

        {/* Mode */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            ⚙️ Modo de Operação
          </h2>

          <label className="flex items-start gap-4 cursor-pointer group mb-4">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={config.modoManual}
                onChange={(e) => {
                  update("modoManual", e.target.checked);
                  if (!e.target.checked) update("forcarPremio", false);
                }}
                className="w-5 h-5 rounded accent-yellow-500"
              />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Modo Manual</div>
              <div className="text-zinc-500 text-xs mt-0.5">
                Ignora o controle financeiro automático
              </div>
            </div>
          </label>

          {config.modoManual && (
            <label className="flex items-start gap-4 cursor-pointer ml-8 bg-zinc-800/60 rounded-xl p-4">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={config.forcarPremio}
                  onChange={(e) => update("forcarPremio", e.target.checked)}
                  className="w-5 h-5 rounded accent-emerald-500"
                />
              </div>
              <div>
                <div className="text-white font-medium text-sm">
                  Forçar Próximo Prêmio
                </div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  O próximo jogo terá um prêmio garantido (resetado após o uso)
                </div>
              </div>
            </label>
          )}

          {!config.modoManual && (
            <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl p-4 text-sm">
              <span className="text-emerald-400 font-medium">
                ✅ Modo Automático ativo
              </span>
              <p className="text-zinc-500 text-xs mt-1">
                O sistema decide automaticamente com base no lucro acumulado e
                na probabilidade configurada.
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 font-black rounded-2xl transition-all disabled:opacity-50 text-black"
          style={{
            background: saved
              ? "#22c55e"
              : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          }}
        >
          {saved ? "✅ Configurações salvas!" : saving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </form>
    </div>
  );
}

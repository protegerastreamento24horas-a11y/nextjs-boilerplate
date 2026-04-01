"use client";

import { useToast, type ToastType, type Toast } from "./ToastContext";

const ICONS: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

const STYLES: Record<ToastType, string> = {
  success: "bg-emerald-900/90 border-emerald-500/50 text-emerald-100",
  error: "bg-red-900/90 border-red-500/50 text-red-100",
  info: "bg-blue-900/90 border-blue-500/50 text-blue-100",
  warning: "bg-yellow-900/90 border-yellow-500/50 text-yellow-100",
};

export default function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg min-w-[300px] max-w-[400px] animate-in slide-in-from-right-full fade-in duration-300`}
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span className="text-xl">{ICONS[toast.type]}</span>
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/50 hover:text-white transition-colors text-lg leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

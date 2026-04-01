"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Abrir pop-up imediatamente ao montar o componente
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay escuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Container do pop-up */}
      <div className="relative w-full max-w-lg transform transition-all animate-fade-in">
        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 w-10 h-10 bg-white text-black rounded-full font-bold text-xl shadow-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          ×
        </button>
        
        {/* Imagem promocional */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/images/promo-popup.png"
            alt="Ganhe 24 Coronas Agora!"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Botão de ação opcional */}
        <div className="mt-4 text-center">
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            PARTICIPAR AGORA
          </button>
        </div>
      </div>
    </div>
  );
}

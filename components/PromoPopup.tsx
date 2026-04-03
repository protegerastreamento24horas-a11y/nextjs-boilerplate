"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PromoPopupProps {
  imageUrl?: string;
  link?: string;
  isActive?: boolean;
  delay?: number;
}

export default function PromoPopup({ 
  imageUrl = "/images/promo-popup.png", 
  link, 
  isActive = true,
  delay = 0 
}: PromoPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    // Abrir pop-up após o delay configurado
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [isActive, delay]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClick = () => {
    if (link) {
      window.open(link, '_blank');
    }
    handleClose();
  };

  if (!isOpen || !isActive) return null;

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
        
        {/* Imagem promocional - clícavel se tiver link */}
        <div 
          className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
          onClick={handleClick}
        >
          <Image
            src={imageUrl}
            alt="Promoção especial!"
            fill
            className="object-cover"
            priority
            unoptimized // Para imagens externas do Imgur
          />
        </div>
        
        {/* Botão de ação */}
        <div className="mt-4 text-center">
          <button
            onClick={handleClick}
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            {link ? "PARTICIPAR AGORA" : "FECHAR"}
          </button>
        </div>
      </div>
    </div>
  );
}

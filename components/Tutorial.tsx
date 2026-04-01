"use client";

import { useState, useEffect } from "react";

interface TutorialStep {
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Bem-vindo! 🎉",
    description: "Vamos te mostrar como jogar a Raspadinha da Sorte em poucos passos.",
    target: "header",
    position: "bottom",
  },
  {
    title: "Cartelas 📱",
    description: "Estas são suas cartelas. Toque em qualquer uma para revelar o que está escondido.",
    target: "grid",
    position: "top",
  },
  {
    title: "Objetivo 🎯",
    description: "Encontre 3 cervejas iguais em uma mesma cartela para ganhar uma caixa!",
    target: "grid",
    position: "top",
  },
  {
    title: "Progresso 📊",
    description: "Acompanhe quantas cartelas já abriu aqui em cima.",
    target: "progress",
    position: "bottom",
  },
  {
    title: "Pronto! 🚀",
    description: "Toque nas cartelas para começar. Boa sorte!",
    target: "grid",
    position: "top",
  },
];

export default function Tutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);

  useEffect(() => {
    // Check if user has seen tutorial
    const seen = localStorage.getItem("raspadinha-tutorial-seen");
    if (!seen) {
      setHasSeenTutorial(false);
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTutorial();
    }
  };

  const handleSkip = () => {
    finishTutorial();
  };

  const finishTutorial = () => {
    localStorage.setItem("raspadinha-tutorial-seen", "true");
    setIsVisible(false);
    setHasSeenTutorial(true);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible || hasSeenTutorial) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Tutorial Card */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-4">
          <span className="text-xs text-zinc-500 font-medium">
            Passo {currentStep + 1} de {tutorialSteps.length}
          </span>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-3 text-white">
            {step.title}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-6 bg-yellow-500"
                  : "bg-zinc-700 hover:bg-zinc-600"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium"
            >
              Anterior
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm hover:opacity-90 transition-opacity"
          >
            {currentStep === tutorialSteps.length - 1 ? "Começar!" : "Próximo"}
          </button>
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="w-full mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Pular tutorial
        </button>
      </div>

      {/* Highlight target (simplified as an arrow indicator) */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
        <div className="animate-bounce text-yellow-500 text-4xl">
          👆
        </div>
      </div>
    </div>
  );
}

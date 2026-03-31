"use client";

import { useRef, useState, useEffect } from "react";

interface ScratchCardProps {
  index: number;
  isRevealed: boolean;
  result?: boolean;
  canReveal: boolean;
  onReveal: (index: number) => void;
}

export default function ScratchCard({
  index,
  isRevealed,
  result,
  canReveal,
  onReveal,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isScratching = useRef(false);
  const hasTriggered = useRef(false);
  const [localRevealed, setLocalRevealed] = useState(false);

  useEffect(() => {
    if (isRevealed) {
      setLocalRevealed(true);
      return;
    }
    drawOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed]);

  function drawOverlay() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gold gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#FFD700");
    gradient.addColorStop(0.4, "#FFC107");
    gradient.addColorStop(0.7, "#FFD700");
    gradient.addColorStop(1, "#B8860B");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texture
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    for (let i = 0; i < canvas.width; i += 6) {
      for (let j = 0; j < canvas.height; j += 6) {
        if ((i + j) % 12 === 0) ctx.fillRect(i, j, 3, 3);
      }
    }

    // Label
    ctx.fillStyle = "#7B5E00";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ RASPE", canvas.width / 2, canvas.height / 2 - 8);
    ctx.fillText("AQUI ✨", canvas.width / 2, canvas.height / 2 + 8);
  }

  function getPos(
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0] ?? e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function scratch(pos: { x: number; y: number }) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
    ctx.fill();

    if (!hasTriggered.current) checkThreshold(canvas, ctx);
  }

  function checkThreshold(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) transparent++;
    }
    const ratio = transparent / (canvas.width * canvas.height);
    if (ratio > 0.45) {
      hasTriggered.current = true;
      setLocalRevealed(true);
      onReveal(index);
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canReveal || localRevealed) return;
    isScratching.current = true;
    scratch(getPos(e, canvasRef.current!));
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching.current || !canReveal || localRevealed) return;
    scratch(getPos(e, canvasRef.current!));
  };
  const handleMouseUp = () => {
    isScratching.current = false;
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!canReveal || localRevealed) return;
    isScratching.current = true;
    scratch(getPos(e, canvasRef.current!));
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isScratching.current || !canReveal || localRevealed) return;
    scratch(getPos(e, canvasRef.current!));
  };
  const handleTouchEnd = () => {
    isScratching.current = false;
  };

  return (
    <div
      className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-300 ${
        localRevealed && result
          ? "border-emerald-500/60 shadow-lg shadow-emerald-900/30"
          : localRevealed && result === false
          ? "border-red-900/40"
          : "border-yellow-600/40 shadow-md shadow-yellow-900/20"
      }`}
    >
      {/* Result underneath */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-colors ${
          localRevealed && result
            ? "bg-emerald-900"
            : localRevealed
            ? "bg-red-950"
            : "bg-zinc-800"
        }`}
      >
        {localRevealed ? (
          <>
            <span className="text-2xl md:text-3xl">
              {result ? "🎉" : "❌"}
            </span>
            <span
              className={`text-[10px] md:text-xs font-bold ${
                result ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {result ? "GANHOU!" : "Não foi..."}
            </span>
          </>
        ) : (
          <span className="text-xl opacity-20">🎴</span>
        )}
      </div>

      {/* Canvas scratch overlay */}
      {!localRevealed && (
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          className={`absolute inset-0 w-full h-full select-none touch-none ${
            canReveal ? "cursor-crosshair" : "cursor-not-allowed opacity-60"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {/* Bloqueado indicator */}
      {!canReveal && !localRevealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[9px] text-zinc-400 font-medium bg-zinc-900/70 px-1.5 py-0.5 rounded text-center leading-tight">
            limite<br />atingido
          </span>
        </div>
      )}
    </div>
  );
}

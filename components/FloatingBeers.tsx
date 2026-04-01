"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export default function FloatingBeers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create beer mug SVG path
    const createBeerMug = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(size / 40, size / 40);
      ctx.globalAlpha = opacity;

      // Glass body
      const gradient = ctx.createLinearGradient(-15, -25, 15, 25);
      gradient.addColorStop(0, "rgba(255, 215, 0, 0.15)");
      gradient.addColorStop(0.5, "rgba(255, 195, 0, 0.1)");
      gradient.addColorStop(1, "rgba(255, 165, 0, 0.15)");

      // Main glass body (rounded rectangle)
      ctx.beginPath();
      ctx.roundRect(-15, -25, 30, 45, 5);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Beer liquid
      ctx.beginPath();
      ctx.roundRect(-13, -10, 26, 28, 3);
      ctx.fillStyle = "rgba(255, 193, 7, 0.4)";
      ctx.fill();

      // Foam head
      ctx.beginPath();
      ctx.roundRect(-13, -15, 26, 8, 3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fill();

      // Bubbles in beer
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      for (let i = 0; i < 5; i++) {
        const bubbleX = -8 + (i * 4);
        const bubbleY = -5 + Math.sin(Date.now() / 1000 + i) * 2;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Handle
      ctx.beginPath();
      ctx.roundRect(15, -10, 10, 25, 3);
      ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(19, -8, 4, 21, 2);
      ctx.fillStyle = "rgba(255, 215, 0, 0.1)";
      ctx.fill();

      // Glass rim highlight
      ctx.beginPath();
      ctx.roundRect(-15, -25, 30, 5, 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fill();

      ctx.restore();
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(15, Math.floor(window.innerWidth / 100));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 25 + Math.random() * 35,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.2 - 0.1,
          opacity: 0.1 + Math.random() * 0.2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 0.5,
        });
      }
    };
    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p: Particle) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Wrap around screen
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        // Draw beer mug
        createBeerMug(ctx, p.x, p.y, p.size, p.rotation, p.opacity);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}

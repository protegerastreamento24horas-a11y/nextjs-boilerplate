declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    origin?: { y?: number };
    colors?: string[];
    zIndex?: number;
    disableForReducedMotion?: boolean;
    scalar?: number;
    startVelocity?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    shapes?: ('square' | 'circle')[];
  }

  function confetti(options?: ConfettiOptions): Promise<void>;

  export default confetti;
}

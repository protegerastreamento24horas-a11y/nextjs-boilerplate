"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "yellow" | "white" | "emerald";
}

export default function LoadingSpinner({ 
  size = "md", 
  color = "yellow" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  const colorClasses = {
    yellow: "border-yellow-400",
    white: "border-white",
    emerald: "border-emerald-400",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Carregando"
    />
  );
}

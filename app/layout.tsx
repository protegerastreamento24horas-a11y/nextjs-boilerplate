import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/ToastContext";
import Toaster from "@/components/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raspadinha da Sorte 🍺",
  description: "Concorra a uma caixa de cerveja por apenas R$2,50!",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-zinc-950 text-white antialiased transition-colors duration-300">
        <ToastProvider>
          <ThemeProvider>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/ToastContext";
import Toaster from "@/components/Toaster";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
    <html lang="pt-BR" className={`${poppins.variable} dark`}>
      <body className="min-h-screen bg-zinc-950 text-white antialiased transition-colors duration-300 font-sans">
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

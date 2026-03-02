import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talentos - Descubre tu futuro profesional",
  description: "Cuestionario de talentos basado en neurociencia aplicada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="min-h-full">
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-full antialiased",
          "bg-[var(--background)] text-[var(--foreground)]",
          "selection:bg-blue-500/30 selection:text-slate-50",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}

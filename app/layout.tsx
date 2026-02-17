import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talentos",
  description: "Talentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="min-h-full">
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

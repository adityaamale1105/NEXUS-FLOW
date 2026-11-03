import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ParticleGridBackground } from "@/components/ParticleGridBackground";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0B0D",
};

export const metadata: Metadata = {
  title: "Nexus-Flow — Autonomous AI Procurement & Financial Orchestration",
  description:
    "AI-powered autonomous procurement and financial orchestration platform converting natural-language requirements into validated, optimized, multi-vendor, payment-ready procurement plans. Built for PayPal AI Hackathon 2026.",
  keywords: [
    "PayPal",
    "AI Autonomous Procurement",
    "Bill of Materials",
    "Multi-Agent",
    "APIMatic",
    "Channel3",
    "Kernel",
    "Hardware Procurement"
  ],
  authors: [{ name: "Nexus-Flow Core Team" }],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-obsidian text-textPrimary min-h-screen flex flex-col antialiased selection:bg-sage/30 selection:text-textPrimary">
        <ParticleGridBackground />
        <Header />
        <main className="flex-1 relative z-10 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

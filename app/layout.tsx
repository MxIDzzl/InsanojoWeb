import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Insanojo Mania 4K Cup",
  description: "Torneo competitivo de osu!mania 4K",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#05010a] text-white">
        <Navbar />

        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>

        <footer className="w-full border-t border-white/10 mt-16 bg-black/30">
          <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-white/50 flex justify-between">
            <p>© {new Date().getFullYear()} Insanojo Mania 4K Cup</p>
            <p className="text-purple-300/70">Website by Vexx</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
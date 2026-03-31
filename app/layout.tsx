import "./globals.css";
import Link from "next/link";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Insanojo Mania 4K Cup",
  description: "Competitive osu!mania 4K Tournament",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-white text-black">
        {/* Navbar */}
        <header className="w-full border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-wide text-purple-300"
            >
              Insanojo Mania Cup
            </Link>

            <div className="flex gap-6 text-sm font-medium text-white/70">
              <Link href="/rules" className="hover:text-purple-300 transition">
                Rules
              </Link>
              <Link
                href="/participants"
                className="hover:text-purple-300 transition"
              >
                Participants
              </Link>
              <Link
                href="/mappools"
                className="hover:text-purple-300 transition"
              >
                Mappools
              </Link>
              <Link
                href="/bracket"
                className="hover:text-purple-300 transition"
              >
                Bracket
              </Link>
              <Link
                href="/schedule"
                className="hover:text-purple-300 transition"
              >
                Schedule
              </Link>
            </div>
            <a
              href="/login"
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition shadow-md shadow-purple-500/20"
            >
              Login
            </a>
          </nav>
        </header>

        {/* Page Content */}
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>

        {/* Footer */}
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

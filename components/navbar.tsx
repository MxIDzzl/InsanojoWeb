"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type User = {
  id: number;
  username: string;
  avatar_url: string;
  country_code: string;
  role: string | null;
};

const NAV_LINKS = [
  { href: "/rules", label: "Reglas" },
  { href: "/participants", label: "Jugadores" },
  { href: "/mappools", label: "Mappool" },
  { href: "/bracket", label: "Brackets" },
  { href: "/schedule", label: "Partidas" },
  { href: "/news", label: "Noticias" },
  { href: "/prizes", label: "Premios" },
  { href: "/staff-list", label: "Staff" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    }

    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const isStaff = user?.role === "owner" || user?.role === "host";

  return (
    <header className="sticky top-0 z-50 border-b border-violet-200/20 bg-[#0f0b20]/90 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-black/25">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/65 sm:px-6">
          <p>Insanojo Mania Cup • Competitive Series</p>
          <p className="text-violet-200/80">Season 2026</p>
        </div>
      </div>

      <nav className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-black uppercase tracking-wide sm:text-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="imc-title-gradient">Insanojo Cup</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "Cerrar" : "Menú"}
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/70 transition hover:border-violet-300/40 hover:bg-violet-500/15 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                href="/register"
                className="rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/70 transition hover:border-violet-300/40 hover:bg-violet-500/15 hover:text-white"
              >
                Registro
              </Link>
            )}

            {isStaff && (
              <Link
                href="/staff"
                className="rounded-md border border-yellow-300/30 bg-yellow-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-yellow-200 transition hover:bg-yellow-300/20"
              >
                Panel Staff
              </Link>
            )}

            {!user ? (
              <Link
                href="/login"
                className="ml-1 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg shadow-violet-900/40"
              >
                Login
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-2 flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1.5 hover:bg-white/10 transition">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-white">{user.username}</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 border border-white/10 bg-black/90 text-white">
                  <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/me">Ver perfil</Link>
                  </DropdownMenuItem>
                  {isStaff && (
                    <DropdownMenuItem asChild>
                      <Link href="/staff" className="text-yellow-300">
                        Panel Staff
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="text-red-300">
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="mt-3 rounded-xl border border-violet-300/20 bg-[#15102b]/95 p-3 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/85 hover:bg-violet-500/15"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/85 hover:bg-violet-500/15"
                >
                  Registro
                </Link>
              )}
              {isStaff && (
                <Link
                  href="/staff"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-yellow-300/30 bg-yellow-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-200"
                >
                  Panel Staff
                </Link>
              )}
            </div>

            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-3 block rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-white"
              >
                Login
              </Link>
            ) : (
              <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">{user.username}</span>
                </div>
                <button type="button" onClick={logout} className="text-xs font-semibold uppercase tracking-wide text-red-300">
                  Salir
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

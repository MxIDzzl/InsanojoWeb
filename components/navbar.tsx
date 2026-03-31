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
  const links = [
    { href: "/rules", label: "Reglas" },
    { href: "/participants", label: "Participantes" },
    { href: "/mappools", label: "Mappools" },
    { href: "/bracket", label: "Bracket" },
    { href: "/schedule", label: "Calendario" },
    { href: "/news", label: "Noticias" },
    { href: "/prizes", label: "Premios" },
    { href: "/staff-list", label: "Staff" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-xl sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-base sm:text-xl font-black tracking-wide">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-300/80" />
            <span className="imc-title-gradient">Insanojo Mania Cup</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden rounded-lg border border-white/15 px-3 py-2 text-sm text-white/90"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "Cerrar" : "Menú"}
          </button>

          <div className="hidden md:flex gap-2 text-sm font-medium text-white/70 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-purple-200 transition"
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link href="/register" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-purple-200 transition">
                Registro
              </Link>
            )}

            {isStaff && (
              <Link href="/staff" className="hover:text-yellow-300 text-yellow-400/80 transition">
                Staff
              </Link>
            )}

            {!user ? (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition shadow-md shadow-violet-900/40"
              >
                Login
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-semibold text-sm">{user.username}</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 bg-black/90 border border-white/10 text-white">
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
          <div className="mt-3 md:hidden imc-panel p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/85 hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/85 hover:bg-white/10"
                >
                  Registro
                </Link>
              )}
              {isStaff && (
                <Link
                  href="/staff"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-yellow-300/30 px-3 py-2 text-yellow-300 hover:bg-yellow-300/10"
                >
                  Staff
                </Link>
              )}
            </div>

            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-3 block rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Login
              </Link>
            ) : (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">{user.username}</span>
                </div>
                <button type="button" onClick={logout} className="text-sm text-red-300">
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

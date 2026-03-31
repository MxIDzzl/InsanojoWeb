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
    <header className="w-full border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-wide text-purple-300">
          Insanojo Mania Cup
        </Link>

        {/* Links */}
        <div className="flex gap-6 text-sm font-medium text-white/70 items-center">
          <Link href="/rules" className="hover:text-purple-300 transition">
            Reglas
          </Link>
          <Link href="/participants" className="hover:text-purple-300 transition">
            Participantes
          </Link>
          <Link href="/mappools" className="hover:text-purple-300 transition">
            Mappools
          </Link>
          <Link href="/bracket" className="hover:text-purple-300 transition">
            Bracket
          </Link>
          <Link href="/schedule" className="hover:text-purple-300 transition">
            Calendario
          </Link>
          <Link href="/news" className="hover:text-purple-300 transition">
            Noticias
          </Link>

          {/* Link registro — solo si está logueado */}
          {user && (
            <Link href="/register" className="hover:text-purple-300 transition">
              Registro
            </Link>
          )}

          {/* Panel staff — solo owner/host */}
          {isStaff && (
            <Link
              href="/staff"
              className="hover:text-yellow-300 text-yellow-400/80 transition"
            >
              Staff
            </Link>
          )}

          {/* Login / User menu */}
          {!user ? (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition shadow-md shadow-purple-500/20"
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
                <span className="text-white font-semibold text-sm">
                  {user.username}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 bg-black/90 border border-white/10 text-white">
                <DropdownMenuLabel>Cuenta</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link href="/me">Ver perfil</Link>
                </DropdownMenuItem>

                {/* Acceso rápido al panel desde el dropdown también */}
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
      </nav>
    </header>
  );
}
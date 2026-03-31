"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type User = {
  id: number;
  username: string;
  avatar_url: string;
  country_code: string;
  role: string | null;
};

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  host: "Host",
  participant: "Participante",
};

export default function MePage() {
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

  if (!user) {
    return <div className="text-white/70">No has iniciado sesión.</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">
        Mi perfil
      </h1>

      <p className="mt-3 text-white/60">
        Información de tu cuenta y estado dentro del torneo.
      </p>

      <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
        <CardContent className="p-6 flex items-center gap-5">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div>
            <p className="text-xl font-bold text-white">{user.username}</p>
            <p className="text-white/60 text-sm">
              ID: {user.id} · País: {user.country_code}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-purple-300">
              Estado en el torneo
            </h2>
            <p className="mt-2 text-white/70">No registrado</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-purple-300">Rol</h2>
            <p className="mt-2 text-white/70">
              {user.role ? roleLabel[user.role] ?? user.role : "Sin rol asignado"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={logout}
        className="mt-10 rounded-2xl bg-red-600 hover:bg-red-500"
      >
        Cerrar sesión
      </Button>
    </div>
  );
}
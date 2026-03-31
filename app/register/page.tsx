"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type User = {
  id: number;
  username: string;
  avatar_url: string;
  country_code: string;
  role: string | null;
};

type RegistrationStatus = "none" | "pending" | "accepted" | "rejected";

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>("none");
  const [discord, setDiscord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);

      // Verificar si ya tiene registro
      const regRes = await fetch("/api/register/status");
      const regData = await regRes.json();
      setRegistrationStatus(regData.status ?? "none");
      setCheckingStatus(false);
    }

    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!discord.trim()) {
      setError("El usuario de Discord es obligatorio.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discord_username: discord.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al registrarse.");
      setLoading(false);
      return;
    }

    setRegistrationStatus("pending");
    setLoading(false);
  }

  if (checkingStatus) {
    return <div className="text-white/70">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">
        Registro al torneo
      </h1>
      <p className="mt-3 text-white/60">
        Inscríbete para participar en el torneo.
      </p>

      {/* Ya tiene registro pendiente */}
      {registrationStatus === "pending" && (
        <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-yellow-400 font-semibold text-lg">⏳ Solicitud pendiente</p>
            <p className="mt-2 text-white/60">
              Tu solicitud está siendo revisada por el staff. Te avisaremos pronto.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Aceptado */}
      {registrationStatus === "accepted" && (
        <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-green-400 font-semibold text-lg">✅ Registro aceptado</p>
            <p className="mt-2 text-white/60">
              Ya eres parte del torneo. Revisa tu perfil para ver tu rol asignado.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rechazado */}
      {registrationStatus === "rejected" && (
        <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-red-400 font-semibold text-lg">❌ Registro rechazado</p>
            <p className="mt-2 text-white/60">
              Tu solicitud fue rechazada. Contacta al staff si crees que es un error.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formulario solo si no tiene registro */}
      {registrationStatus === "none" && (
        <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            {/* Datos de osu! (solo lectura, sacados automáticamente) */}
            <div className="mb-6">
              <p className="text-sm text-white/50 mb-1">Usuario de osu!</p>
              <p className="text-white font-semibold">{user?.username}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-white/50 mb-1">País</p>
              <p className="text-white font-semibold">{user?.country_code}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-1 block">
                  Usuario de Discord
                </label>
                <Input
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="ejemplo#1234 o @ejemplo"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-purple-600 hover:bg-purple-500"
              >
                {loading ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
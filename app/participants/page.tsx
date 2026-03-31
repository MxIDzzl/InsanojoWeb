"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Participant = {
  id: string;
  osu_id: number;
  discord_username: string;
  round: string | null;
  eliminated: boolean;
  users: {
    username: string;
    avatar_url: string;
  } | null;
};

const roundLabel: Record<string, string> = {
  qualifier: "Qualifier",
  playoffs: "Playoffs",
  quarter_finals: "Quarter Finals",
  semi_finals: "Semi Finals",
  finals: "Finals",
  lower_quarter_finals: "Lower Quarter Finals",
  lower_semi_finals: "Lower Semi Finals",
  lower_finals: "Lower Finals",
  lower_grand_finals: "Lower Grand Finals",
  grand_finals: "Grand Finals",
};

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/participants");
      const data = await res.json();
      setParticipants(data.participants ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-white/70">Cargando participantes...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">
        Participantes
      </h1>
      <p className="mt-3 text-white/60">
        Jugadores registrados en el torneo.{" "}
        <span className="text-purple-300 font-semibold">
          {participants.length} jugadores
        </span>
      </p>

      {participants.length === 0 ? (
        <Card className="mt-8 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-white/50">Aún no hay participantes registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4">
          {participants.map((p) => {
            const username = p.users?.username ?? `osu! ID ${p.osu_id}`;
            const avatarUrl = p.users?.avatar_url ?? "https://a.ppy.sh";
            return (
            <Card
              key={p.id}
              className={`rounded-2xl border ${
                p.eliminated
                  ? "bg-red-950/20 border-red-900/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <CardContent className="p-5 flex items-center gap-5">
                {/* Avatar */}
                <img
                  src={avatarUrl}
                  alt={username}
                  className={`w-16 h-16 rounded-full flex-shrink-0 ${
                    p.eliminated ? "grayscale opacity-50" : ""
                  }`}
                />

                {/* Info */}
                <div className="flex-1 grid md:grid-cols-2 gap-x-8 gap-y-1">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Nombre</p>
                    <p className={`font-bold text-lg ${p.eliminated ? "text-white/40" : "text-white"}`}>
                      {username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">osu! ID</p>
                    <p className={`font-medium ${p.eliminated ? "text-white/40" : "text-white/80"}`}>
                      {p.osu_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Discord</p>
                    <p className={`font-medium ${p.eliminated ? "text-white/40" : "text-white/80"}`}>
                      {p.discord_username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">País</p>
                    <p className={`font-medium ${p.eliminated ? "text-white/40" : "text-white/80"}`}>
                      —
                    </p>
                  </div>
                </div>

                {/* Estado y ronda */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {p.eliminated ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900/40 text-red-400 border border-red-800/40">
                      Eliminado
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900/40 text-green-400 border border-green-800/40">
                      Activo
                    </span>
                  )}

                  {p.round && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-900/40 text-purple-300 border border-purple-800/40">
                      {p.eliminated ? "Eliminado en: " : ""}{roundLabel[p.round] ?? p.round}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

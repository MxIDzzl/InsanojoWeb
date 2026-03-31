"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Registration = {
  id: string;
  osu_id: number;
  discord_username: string;
  status: string;
  created_at: string;
  users: {
    username: string;
    avatar_url: string;
    country_code: string;
  };
};

type Participant = {
  id: string;
  osu_id: number;
  discord_username: string;
  round: string | null;
  eliminated: boolean;
  users: {
    username: string;
    avatar_url: string;
    country_code: string;
  };
};

type Action = {
  id: string;
  selectedRole: string;
  loading: boolean;
};

const ROUNDS = [
  { value: "qualifier", label: "Qualifier" },
  { value: "playoffs", label: "Playoffs" },
  { value: "quarter_finals", label: "Quarter Finals" },
  { value: "semi_finals", label: "Semi Finals" },
  { value: "finals", label: "Finals" },
  { value: "lower_quarter_finals", label: "Lower Quarter Finals" },
  { value: "lower_semi_finals", label: "Lower Semi Finals" },
  { value: "lower_finals", label: "Lower Finals" },
  { value: "lower_grand_finals", label: "Lower Grand Finals" },
  { value: "grand_finals", label: "Grand Finals" },
];

export default function StaffPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [savingParticipant, setSavingParticipant] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (
        !meData.user ||
        (meData.user.role !== "owner" && meData.user.role !== "host")
      ) {
        setUnauthorized(true);
        setPageLoading(false);
        return;
      }

      // Solicitudes pendientes
      const regRes = await fetch("/api/staff/registrations");
      const regData = await regRes.json();
      setRegistrations(regData.registrations ?? []);

      const initialActions: Record<string, Action> = {};
      for (const reg of regData.registrations ?? []) {
        initialActions[reg.id] = {
          id: reg.id,
          selectedRole: "participant",
          loading: false,
        };
      }
      setActions(initialActions);

      // Participantes aceptados
      const partRes = await fetch("/api/participants");
      const partData = await partRes.json();
      setParticipants(partData.participants ?? []);

      setPageLoading(false);
    }

    load();
  }, []);

  async function handleReview(
    registrationId: string,
    decision: "accepted" | "rejected"
  ) {
    setActions((prev) => ({
      ...prev,
      [registrationId]: { ...prev[registrationId], loading: true },
    }));

    const res = await fetch("/api/staff/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registration_id: registrationId,
        decision,
        role: decision === "accepted" ? actions[registrationId].selectedRole : null,
      }),
    });

    if (res.ok) {
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));

      // Si fue aceptado, recargar participantes
      if (decision === "accepted") {
        const partRes = await fetch("/api/participants");
        const partData = await partRes.json();
        setParticipants(partData.participants ?? []);
      }
    } else {
      setActions((prev) => ({
        ...prev,
        [registrationId]: { ...prev[registrationId], loading: false },
      }));
    }
  }

  if (pageLoading) {
    return <div className="text-white/70">Cargando...</div>;
  }

  if (unauthorized) {
    return (
      <div className="text-red-400 font-semibold">
        No tienes permiso para ver esta página.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">
        Panel Staff
      </h1>
      <p className="mt-3 text-white/60">
        Gestiona registros y participantes del torneo.
      </p>

      {/* ── Solicitudes pendientes ── */}
      <h2 className="mt-12 text-2xl font-bold text-white">
        Solicitudes pendientes
      </h2>

      {registrations.length === 0 ? (
        <Card className="mt-4 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-white/50">No hay solicitudes pendientes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {registrations.map((reg) => (
            <Card key={reg.id} className="rounded-2xl bg-white/5 border-white/10">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={reg.users.avatar_url}
                    alt={reg.users.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-white font-bold text-lg">
                      {reg.users.username}
                    </p>
                    <p className="text-white/50 text-sm">
                      osu! ID: {reg.osu_id} · País: {reg.users.country_code}
                    </p>
                    <p className="text-white/50 text-sm">
                      Discord: {reg.discord_username}
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      Solicitado:{" "}
                      {new Date(reg.created_at).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={actions[reg.id]?.selectedRole ?? "participant"}
                    onValueChange={(val: string) =>
                      setActions((prev) => ({
                        ...prev,
                        [reg.id]: { ...prev[reg.id], selectedRole: val },
                      }))
                    }
                    disabled={actions[reg.id]?.loading}
                  >
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      <SelectItem value="participant">Participante</SelectItem>
                      <SelectItem value="host">Host</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => handleReview(reg.id, "accepted")}
                    disabled={actions[reg.id]?.loading}
                    className="rounded-xl bg-green-600 hover:bg-green-500"
                  >
                    Aceptar
                  </Button>

                  <Button
                    onClick={() => handleReview(reg.id, "rejected")}
                    disabled={actions[reg.id]?.loading}
                    variant="destructive"
                    className="rounded-xl"
                  >
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Gestión de participantes ── */}
      <h2 className="mt-14 text-2xl font-bold text-white">
        Gestión de participantes
      </h2>
      <p className="mt-2 text-white/50 text-sm">
        Actualiza la ronda y estado de cada jugador.
      </p>

      {participants.length === 0 ? (
        <Card className="mt-4 rounded-2xl bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-white/50">No hay participantes aceptados aún.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {participants.map((p) => (
            <Card key={p.id} className="rounded-2xl bg-white/5 border-white/10">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={p.users.avatar_url}
                    alt={p.users.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">{p.users.username}</p>
                    <p className="text-white/40 text-xs">{p.discord_username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={p.round ?? ""}
                    onValueChange={(val: string) =>
                      setParticipants((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, round: val } : x
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-52 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Seleccionar ronda" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      {ROUNDS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant={p.eliminated ? "outline" : "destructive"}
                    className="rounded-xl"
                    onClick={() =>
                      setParticipants((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, eliminated: !x.eliminated } : x
                        )
                      )
                    }
                  >
                    {p.eliminated ? "Reactivar" : "Eliminar"}
                  </Button>

                  <Button
                    className="rounded-xl bg-purple-600 hover:bg-purple-500"
                    disabled={savingParticipant === p.id}
                    onClick={async () => {
                      setSavingParticipant(p.id);
                      await fetch("/api/staff/update-participant", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          registration_id: p.id,
                          round: p.round,
                          eliminated: p.eliminated,
                        }),
                      });
                      setSavingParticipant(null);
                    }}
                  >
                    {savingParticipant === p.id ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
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
    country_code?: string | null;
  } | null;
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
    country_code?: string | null;
  } | null;
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
  // Estados existentes
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [savingParticipant, setSavingParticipant] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Estados de noticias
  const [newsList, setNewsList] = useState<{ id: number; title: string; created_at: string }[]>([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImage, setNewsImage] = useState("");
  const [publishingNews, setPublishingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceEndsAt, setMaintenanceEndsAt] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meData.user || (meData.user.role !== "owner" && meData.user.role !== "host")) {
        setUnauthorized(true);
        setPageLoading(false);
        return;
      }

      // Solicitudes pendientes
      const regRes = await fetch("/api/staff/registrations");
      const regData = await regRes.json();
      if (!regRes.ok) {
        setLoadError(regData.error ?? "No se pudieron cargar las solicitudes pendientes.");
      }
      setRegistrations(regData.registrations ?? []);

      const initialActions: Record<string, Action> = {};
      for (const reg of regData.registrations ?? []) {
        initialActions[reg.id] = { id: reg.id, selectedRole: "participant", loading: false };
      }
      setActions(initialActions);

      // Participantes aceptados
      const partRes = await fetch("/api/participants");
      const partData = await partRes.json();
      if (!partRes.ok) {
        setLoadError((prev) => prev ?? partData.error ?? "No se pudieron cargar los participantes.");
      }
      setParticipants(partData.participants ?? []);

      // Noticias
      const newsRes = await fetch("/api/news");
      const newsData = await newsRes.json();
      setNewsList(newsData.news ?? []);

      // Modo mantenimiento
      const maintenanceRes = await fetch("/api/staff/maintenance");
      const maintenanceData = await maintenanceRes.json();
      if (maintenanceRes.ok) {
        setMaintenanceEnabled(Boolean(maintenanceData.maintenance?.maintenance_enabled));
        setMaintenanceMessage(maintenanceData.maintenance?.maintenance_message ?? "");
        if (maintenanceData.maintenance?.maintenance_ends_at) {
          const date = new Date(maintenanceData.maintenance.maintenance_ends_at);
          const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setMaintenanceEndsAt(local);
        } else {
          setMaintenanceEndsAt("");
        }
      }

      setPageLoading(false);
    }

    load();
  }, []);

  // Funciones existentes
  async function handleReview(registrationId: string, decision: "accepted" | "rejected") {
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

  // Funciones de noticias
  async function handlePublishNews() {
    setNewsError(null);
    if (!newsTitle.trim() || !newsContent.trim()) {
      setNewsError("El título y contenido son obligatorios.");
      return;
    }

    setPublishingNews(true);
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newsTitle,
        content: newsContent,
        image_url: newsImage || null,
      }),
    });

    if (res.ok) {
      setNewsTitle("");
      setNewsContent("");
      setNewsImage("");
      const newsRes = await fetch("/api/news");
      const newsData = await newsRes.json();
      setNewsList(newsData.news ?? []);
    } else {
      const data = await res.json();
      setNewsError(data.error ?? "Error al publicar.");
    }
    setPublishingNews(false);
  }

  async function handleDeleteNews(id: number) {
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) setNewsList((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleSaveMaintenance() {
    setSavingMaintenance(true);
    setMaintenanceError(null);
    const res = await fetch("/api/staff/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: maintenanceEnabled,
        ends_at: maintenanceEndsAt || null,
        message: maintenanceMessage || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMaintenanceError(data.error ?? "No se pudo guardar el mantenimiento.");
    }

    setSavingMaintenance(false);
  }

  if (pageLoading) return <div className="text-white/70">Cargando...</div>;
  if (unauthorized)
    return (
      <div className="text-red-400 font-semibold">
        No tienes permiso para ver esta página.
      </div>
    );

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Panel Staff</h1>
      <p className="mt-3 text-white/60">
        Gestiona registros y participantes del torneo.
      </p>
      {loadError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {loadError}
        </div>
      )}

      {/* ── Solicitudes pendientes ── */}
      <h2 className="mt-10 text-2xl font-bold text-white">Solicitudes pendientes</h2>
      <div className="mt-4 grid gap-4">
        {registrations.length === 0 ? (
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-5">
              <p className="text-sm text-white/50">No hay solicitudes pendientes por revisar.</p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((reg) => {
            const action = actions[reg.id] ?? { id: reg.id, selectedRole: "participant", loading: false };
            const username = reg.users?.username ?? `osu! ID ${reg.osu_id}`;
            const createdAt = new Date(reg.created_at).toLocaleString("es-MX", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card key={reg.id} className="rounded-2xl bg-white/5 border-white/10">
                <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-white font-semibold">{username}</p>
                    <p className="text-sm text-white/60">@{reg.discord_username}</p>
                    <p className="text-xs text-white/40 mt-1">
                      Solicitó acceso el {createdAt}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Select
                      value={action.selectedRole}
                      onValueChange={(value) =>
                        setActions((prev) => ({
                          ...prev,
                          [reg.id]: { ...action, selectedRole: value },
                        }))
                      }
                    >
                      <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Rol al aceptar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participant">participant</SelectItem>
                        <SelectItem value="host">host</SelectItem>
                        <SelectItem value="owner">owner</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
                      disabled={action.loading}
                      onClick={() => handleReview(reg.id, "accepted")}
                    >
                      Aceptar
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      disabled={action.loading}
                      onClick={() => handleReview(reg.id, "rejected")}
                    >
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ── Gestión de participantes ── */}
      <h2 className="mt-14 text-2xl font-bold text-white">Participantes aceptados</h2>
      <div className="mt-4 grid gap-4">
        {participants.length === 0 ? (
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-5">
              <p className="text-sm text-white/50">No hay participantes aceptados todavía.</p>
            </CardContent>
          </Card>
        ) : (
          participants.map((participant) => {
            const username = participant.users?.username ?? `osu! ID ${participant.osu_id}`;
            const roundValue = participant.round ?? "qualifier";
            const isSaving = savingParticipant === participant.id;

            return (
              <Card key={participant.id} className="rounded-2xl bg-white/5 border-white/10">
                <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-white font-semibold">{username}</p>
                    <p className="text-sm text-white/60">@{participant.discord_username}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {participant.eliminated ? "Eliminado" : "Activo"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <Select
                      value={roundValue}
                      onValueChange={(value) =>
                        setParticipants((prev) =>
                          prev.map((p) => (p.id === participant.id ? { ...p, round: value } : p))
                        )
                      }
                    >
                      <SelectTrigger className="w-[220px] bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Ronda" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUNDS.map((round) => (
                          <SelectItem key={round.value} value={round.value}>
                            {round.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      className="rounded-xl"
                      variant={participant.eliminated ? "secondary" : "outline"}
                      onClick={() =>
                        setParticipants((prev) =>
                          prev.map((p) =>
                            p.id === participant.id ? { ...p, eliminated: !p.eliminated } : p
                          )
                        )
                      }
                    >
                      {participant.eliminated ? "Reactivar" : "Marcar eliminado"}
                    </Button>

                    <Button
                      className="rounded-xl bg-purple-600 hover:bg-purple-500"
                      disabled={isSaving}
                      onClick={async () => {
                        setSavingParticipant(participant.id);
                        const target = participants.find((p) => p.id === participant.id);
                        if (!target) {
                          setSavingParticipant(null);
                          return;
                        }

                        const res = await fetch("/api/staff/update-participant", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            registration_id: target.id,
                            round: target.round ?? "qualifier",
                            eliminated: target.eliminated,
                          }),
                        });

                        if (!res.ok) {
                          const latestRes = await fetch("/api/participants");
                          const latestData = await latestRes.json();
                          setParticipants(latestData.participants ?? []);
                        }

                        setSavingParticipant(null);
                      }}
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ── Modo mantenimiento ── */}
      <h2 className="mt-14 text-2xl font-bold text-white">Modo mantenimiento</h2>
      <p className="mt-2 text-white/50 text-sm">
        Cuando está activo, solo staff (owner/host) puede usar el sitio. Los demás verán pantalla de mantenimiento.
      </p>
      <Card className="mt-4 rounded-2xl bg-white/5 border-white/10">
        <CardContent className="p-6 flex flex-col gap-4">
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={maintenanceEnabled}
              onChange={(e) => setMaintenanceEnabled(e.target.checked)}
            />
            Activar mantenimiento global
          </label>

          <div>
            <label className="text-sm text-white/50 mb-1 block">Fin estimado (cuenta regresiva)</label>
            <input
              type="datetime-local"
              value={maintenanceEndsAt}
              onChange={(e) => setMaintenanceEndsAt(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 w-full p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-white/50 mb-1 block">Mensaje de mantenimiento</label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={3}
              placeholder="Estamos en mantenimiento, volvemos pronto..."
              className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 p-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {maintenanceError && <p className="text-red-400 text-sm">{maintenanceError}</p>}
          <Button
            className="rounded-xl bg-amber-600 hover:bg-amber-500 w-fit"
            onClick={handleSaveMaintenance}
            disabled={savingMaintenance}
          >
            {savingMaintenance ? "Guardando..." : "Guardar mantenimiento"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Noticias ── */}
      <h2 className="mt-14 text-2xl font-bold text-white">Publicar noticia</h2>
      <p className="mt-2 text-white/50 text-sm">
        Soporta BBCode igual que el foro de osu!
      </p>

      <Card className="mt-4 rounded-2xl bg-white/5 border-white/10">
        <CardContent className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/50 mb-1 block">Título</label>
            <input
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              placeholder="Título de la noticia"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 w-full p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-white/50 mb-1 block">
              URL de imagen (opcional)
            </label>
            <input
              value={newsImage}
              onChange={(e) => setNewsImage(e.target.value)}
              placeholder="https://..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 w-full p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-white/50 mb-1 block">
              Contenido (BBCode)
            </label>
            <textarea
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="Escribe aquí usando BBCode..."
              rows={10}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 p-3 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {newsError && <p className="text-red-400 text-sm">{newsError}</p>}

          <Button
            onClick={handlePublishNews}
            disabled={publishingNews}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 w-fit"
          >
            {publishingNews ? "Publicando..." : "Publicar noticia"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de noticias publicadas */}
      <div className="mt-6 flex flex-col gap-3">
        {newsList.map((item) => (
          <Card key={item.id} className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-white/30 text-xs">
                  {new Date(item.created_at).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={() => handleDeleteNews(item.id)}
              >
                Eliminar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

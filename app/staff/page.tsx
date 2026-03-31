"use client";

import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
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

type MappoolCollection = {
  id: number;
  title: string;
  stage: string | null;
  accent_color: string | null;
  drive_url: string | null;
  items: {
    id: number;
    title: string | null;
    artist: string | null;
    mods: string | null;
    beatmap_url: string;
    sort_order: number;
  }[];
};

type BracketNode = {
  id: number;
  stage: string | null;
  scheduled_at: string | null;
  x: number;
  y: number;
  team1: string | null;
  team2: string | null;
  score1: number | null;
  score2: number | null;
  best_of: number | null;
};

type BracketEdge = {
  id: number;
  source_id: number;
  target_id: number;
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
  const [mappools, setMappools] = useState<MappoolCollection[]>([]);
  const [poolTitle, setPoolTitle] = useState("");
  const [poolStage, setPoolStage] = useState("");
  const [poolColor, setPoolColor] = useState("#a855f7");
  const [poolDrive, setPoolDrive] = useState("");
  const [poolTargetId, setPoolTargetId] = useState("");
  const [poolBeatmapUrl, setPoolBeatmapUrl] = useState("");
  const [poolMods, setPoolMods] = useState("");
  const [poolItemColor, setPoolItemColor] = useState("#a855f7");
  const [poolPreview, setPoolPreview] = useState<{
    title: string;
    artist: string;
    version: string;
    star_rating: number | null;
    is_mania: boolean | null;
    is_duplicate: boolean;
  } | null>(null);
  const [poolPreviewLoading, setPoolPreviewLoading] = useState(false);
  const [draggingItemId, setDraggingItemId] = useState<number | null>(null);
  const [poolError, setPoolError] = useState<string | null>(null);
  const [bracketNodes, setBracketNodes] = useState<BracketNode[]>([]);
  const [bracketEdges, setBracketEdges] = useState<BracketEdge[]>([]);
  const [nodeStage, setNodeStage] = useState("");
  const [nodeDate, setNodeDate] = useState("");
  const [nodeX, setNodeX] = useState("0");
  const [nodeY, setNodeY] = useState("0");
  const [nodeTeam1, setNodeTeam1] = useState("");
  const [nodeTeam2, setNodeTeam2] = useState("");
  const [nodeScore1, setNodeScore1] = useState("0");
  const [nodeScore2, setNodeScore2] = useState("0");
  const [nodeBestOf, setNodeBestOf] = useState("9");
  const [editingNodeId, setEditingNodeId] = useState("");
  const [edgeSourceId, setEdgeSourceId] = useState("");
  const [edgeTargetId, setEdgeTargetId] = useState("");
  const [bracketError, setBracketError] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const [savingNodePositionId, setSavingNodePositionId] = useState<number | null>(null);
  const bracketBoardRef = useRef<HTMLDivElement | null>(null);

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

      const poolsRes = await fetch("/api/mappools");
      const poolsData = await poolsRes.json();
      setMappools(poolsData.mappools ?? []);

      const bracketRes = await fetch("/api/bracket");
      const bracketData = await bracketRes.json();
      setBracketNodes(bracketData.nodes ?? []);
      setBracketEdges(bracketData.edges ?? []);

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


  async function refreshMappools() {
    const res = await fetch("/api/mappools", { cache: "no-store" });
    const data = await res.json();
    setMappools(data.mappools ?? []);
  }

  async function refreshBracket() {
    const res = await fetch("/api/bracket", { cache: "no-store" });
    const data = await res.json();
    setBracketNodes(data.nodes ?? []);
    setBracketEdges(data.edges ?? []);
  }

  async function handleCreateMappool() {
    setPoolError(null);
    const res = await fetch("/api/staff/mappools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "create_collection",
        title: poolTitle,
        stage: poolStage,
        accent_color: poolColor,
        drive_url: poolDrive,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setPoolError(data.error ?? "No se pudo crear bloque.");
    setPoolTitle("");
    setPoolStage("");
    setPoolDrive("");
    await refreshMappools();
  }

  async function handleAddBeatmap() {
    setPoolError(null);
    if (poolPreview?.is_duplicate) {
      setPoolError("Ese beatmap ya existe en este bloque.");
      return;
    }
    if (poolPreview?.is_mania === false) {
      setPoolError("Solo se permiten beatmaps de osu!mania.");
      return;
    }
    const res = await fetch("/api/staff/mappools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "add_item",
        collection_id: Number(poolTargetId),
        beatmap_url: poolBeatmapUrl,
        mods: poolMods,
        label_color: poolItemColor,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setPoolError(data.error ?? "No se pudo agregar mapa.");
    setPoolBeatmapUrl("");
    setPoolMods("");
    setPoolPreview(null);
    await refreshMappools();
  }

  async function handlePreviewBeatmap() {
    if (!poolBeatmapUrl.trim()) return;
    setPoolError(null);
    setPoolPreviewLoading(true);
    const res = await fetch("/api/staff/mappools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "preview_item",
        collection_id: poolTargetId ? Number(poolTargetId) : null,
        beatmap_url: poolBeatmapUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPoolPreview(null);
      setPoolError(data.error ?? "No se pudo previsualizar el beatmap.");
    } else {
      setPoolPreview(data.preview ?? null);
    }
    setPoolPreviewLoading(false);
  }

  async function handleReorderPoolItems(collectionId: number, orderedIds: number[]) {
    const res = await fetch("/api/staff/mappools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "reorder_items",
        collection_id: collectionId,
        ordered_item_ids: orderedIds,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPoolError(data.error ?? "No se pudo reordenar el mappool.");
      return;
    }
    await refreshMappools();
  }

  async function handleCreateBracketNode() {
    setBracketError(null);
    const scheduledAt = nodeDate ? new Date(nodeDate).toISOString() : null;
    const res = await fetch("/api/staff/bracket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "upsert_node",
        id: editingNodeId ? Number(editingNodeId) : null,
        stage: nodeStage,
        scheduled_at: scheduledAt,
        x: Number(nodeX),
        y: Number(nodeY),
        team1: nodeTeam1,
        team2: nodeTeam2,
        score1: Number(nodeScore1),
        score2: Number(nodeScore2),
        best_of: Number(nodeBestOf),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setBracketError(data.error ?? "No se pudo guardar duelo.");
    await refreshBracket();
  }

  async function handleCreateEdge() {
    setBracketError(null);
    const res = await fetch("/api/staff/bracket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "add_edge",
        source_id: Number(edgeSourceId),
        target_id: Number(edgeTargetId),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setBracketError(data.error ?? "No se pudo conectar nodos.");
    await refreshBracket();
  }


  async function handleDeleteMappool(id: number) {
    await fetch(`/api/staff/mappools?type=collection&id=${id}`, { method: "DELETE" });
    await refreshMappools();
  }

  async function handleDeleteBracketNode(id: number) {
    await fetch(`/api/staff/bracket?type=node&id=${id}`, { method: "DELETE" });
    await refreshBracket();
  }

  function handleLoadBracketNode(id: string) {
    setEditingNodeId(id);
    const target = bracketNodes.find((node) => String(node.id) === id);
    if (!target) return;
    setNodeStage(target.stage ?? "");
    setNodeTeam1(target.team1 ?? "");
    setNodeTeam2(target.team2 ?? "");
    setNodeX(String(target.x ?? 0));
    setNodeY(String(target.y ?? 0));
    setNodeScore1(String(target.score1 ?? 0));
    setNodeScore2(String(target.score2 ?? 0));
    setNodeBestOf(String(target.best_of ?? 9));
    setNodeDate(target.scheduled_at ? new Date(target.scheduled_at).toISOString().slice(0, 16) : "");
  }

  async function handleDeleteBracketEdge(id: number) {
    await fetch(`/api/staff/bracket?type=edge&id=${id}`, { method: "DELETE" });
    await refreshBracket();
  }

  async function handleDragBracketNodeEnd(event: DragEvent<HTMLDivElement>, nodeId: number) {
    event.preventDefault();
    const board = bracketBoardRef.current;
    const target = bracketNodes.find((node) => node.id === nodeId);
    if (!board || !target) return;

    const rect = board.getBoundingClientRect();
    const nextX = Math.max(0, Math.round(event.clientX - rect.left - 100));
    const nextY = Math.max(0, Math.round(event.clientY - rect.top - 45));

    setBracketNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, x: nextX, y: nextY } : node))
    );
    setSavingNodePositionId(nodeId);
    setBracketError(null);
    const res = await fetch("/api/staff/bracket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "upsert_node",
        id: nodeId,
        stage: target.stage,
        scheduled_at: target.scheduled_at,
        x: nextX,
        y: nextY,
        team1: target.team1,
        team2: target.team2,
        score1: target.score1 ?? 0,
        score2: target.score2 ?? 0,
        best_of: target.best_of ?? 9,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBracketError(data.error ?? "No se pudo guardar la posición del nodo.");
    } else {
      await refreshBracket();
    }
    setSavingNodePositionId(null);
    setDraggingNodeId(null);
  }

  const bracketCanvasSize = useMemo(() => {
    const width = Math.max(900, ...bracketNodes.map((node) => node.x + 260));
    const height = Math.max(400, ...bracketNodes.map((node) => node.y + 140));
    return { width, height };
  }, [bracketNodes]);

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

      {/* ── Mappools custom ── */}
      <h2 className="mt-14 text-2xl font-bold text-white">Mappools (editor staff)</h2>
      <p className="mt-2 text-white/50 text-sm">Crea bloques personalizados y pega links de osu!, el sistema detecta la info automáticamente.</p>
      <Card className="mt-4 rounded-2xl bg-white/5 border-white/10">
        <CardContent className="p-6 grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input value={poolTitle} onChange={(e) => setPoolTitle(e.target.value)} placeholder="Título del bloque" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={poolStage} onChange={(e) => setPoolStage(e.target.value)} placeholder="Etapa (ej. Quarterfinals)" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input type="color" value={poolColor} onChange={(e) => setPoolColor(e.target.value)} className="h-10 rounded-lg bg-transparent" />
            <input value={poolDrive} onChange={(e) => setPoolDrive(e.target.value)} placeholder="Link de Drive del mappool" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
          </div>
          <Button className="w-fit rounded-xl bg-purple-600 hover:bg-purple-500" onClick={handleCreateMappool}>Crear bloque</Button>

          <div className="mt-2 grid md:grid-cols-2 gap-3">
            <select value={poolTargetId} onChange={(e) => setPoolTargetId(e.target.value)} className="bg-white/5 border border-white/10 text-white p-2 rounded-lg">
              <option value="">Selecciona bloque destino</option>
              {mappools.map((pool) => <option key={pool.id} value={pool.id}>{pool.title}</option>)}
            </select>
            <input value={poolBeatmapUrl} onChange={(e) => setPoolBeatmapUrl(e.target.value)} placeholder="https://osu.ppy.sh/beatmapsets/..." className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={poolMods} onChange={(e) => setPoolMods(e.target.value)} placeholder="Etiqueta mod (NM1, DT2, etc.)" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input type="color" value={poolItemColor} onChange={(e) => setPoolItemColor(e.target.value)} className="h-10 rounded-lg bg-transparent" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="w-fit rounded-xl" variant="secondary" onClick={handlePreviewBeatmap} disabled={poolPreviewLoading}>
              {poolPreviewLoading ? "Consultando..." : "Previsualizar"}
            </Button>
            <Button className="w-fit rounded-xl" onClick={handleAddBeatmap}>Agregar mapa al bloque</Button>
          </div>
          {poolPreview && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <p className="font-semibold text-white">{poolPreview.artist} - {poolPreview.title}</p>
              <p className="text-xs text-white/60">
                {poolPreview.version} · {typeof poolPreview.star_rating === "number" ? `${poolPreview.star_rating.toFixed(2)}★` : "Sin star rating"}
              </p>
              <p className={`text-xs mt-1 ${poolPreview.is_mania === false ? "text-red-300" : "text-emerald-300"}`}>
                {poolPreview.is_mania === false ? "Modo no válido: este beatmap no es mania." : "Modo válido (mania o no verificable)."}
              </p>
              {poolPreview.is_duplicate && <p className="text-xs mt-1 text-amber-300">Beatmap duplicado en este bloque.</p>}
            </div>
          )}
          <p className="text-xs text-white/50">Soporta links como: osu.ppy.sh/beatmaps/ID, /b/ID y /beatmapsets/...#mania/ID</p>
          {poolError && <p className="text-sm text-red-300">{poolError}</p>}

          <div className="mt-2 grid gap-2">
            {mappools.map((pool) => (
              <div key={pool.id} className="rounded-lg border border-white/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">{pool.title} <span className="text-white/50 text-xs">({pool.stage || "sin etapa"})</span></p>
                    <p className="text-xs text-white/60">{pool.items.length} mapas</p>
                  </div>
                  <Button variant="destructive" className="rounded-xl" onClick={() => handleDeleteMappool(pool.id)}>Eliminar</Button>
                </div>
                <div className="mt-3 grid gap-2">
                  {pool.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggingItemId(item.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={async () => {
                        if (!draggingItemId || draggingItemId === item.id) return;
                        const next = [...pool.items];
                        const from = next.findIndex((entry) => entry.id === draggingItemId);
                        const to = next.findIndex((entry) => entry.id === item.id);
                        if (from < 0 || to < 0) return;
                        const [moved] = next.splice(from, 1);
                        next.splice(to, 0, moved);
                        setMappools((prev) =>
                          prev.map((entry) => (entry.id === pool.id ? { ...entry, items: next } : entry))
                        );
                        setDraggingItemId(null);
                        await handleReorderPoolItems(pool.id, next.map((entry) => entry.id));
                      }}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80 bg-black/20 cursor-move"
                    >
                      <span className="text-white/50 mr-2">#{item.sort_order + 1}</span>
                      <span className="font-semibold">{item.mods || "MOD"}</span>
                      <span className="mx-2 text-white/40">·</span>
                      <span>{item.artist || "Unknown Artist"} - {item.title || "Beatmap"}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-white/40">Arrastra y suelta para reordenar mapas.</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Bracket custom ── */}
      <h2 className="mt-14 text-2xl font-bold text-white">Bracket (editor staff)</h2>
      <p className="mt-2 text-white/50 text-sm">Crea y edita duelos manualmente, define etapa/fecha y conecta cada bloque.</p>
      <div className="mt-2">
        <select value={editingNodeId} onChange={(e) => handleLoadBracketNode(e.target.value)} className="bg-white/5 border border-white/10 text-white p-2 rounded-lg">
          <option value="">Nuevo duelo</option>
          {bracketNodes.map((node) => <option key={`edit-${node.id}`} value={node.id}>Editar #{node.id} · {node.team1 || "TBD"} vs {node.team2 || "TBD"}</option>)}
        </select>
      </div>
      <Card className="mt-4 rounded-2xl bg-white/5 border-white/10">
        <CardContent className="p-6 grid gap-3">
          <div
            ref={bracketBoardRef}
            className="relative overflow-auto rounded-xl border border-white/10 bg-[#0f1425] p-3"
            style={{ minHeight: 280 }}
          >
            <div className="relative" style={{ width: bracketCanvasSize.width, height: bracketCanvasSize.height }}>
              {bracketNodes.map((node) => (
                <div
                  key={`drag-node-${node.id}`}
                  draggable
                  onDragStart={() => setDraggingNodeId(node.id)}
                  onDragEnd={(event) => handleDragBracketNodeEnd(event, node.id)}
                  className={`absolute w-[200px] rounded-lg border p-2 text-xs cursor-grab ${
                    draggingNodeId === node.id ? "border-purple-400 bg-purple-500/20" : "border-white/20 bg-slate-900/70"
                  }`}
                  style={{ left: node.x, top: node.y }}
                >
                  <p className="font-semibold text-white">#{node.id} · {node.stage || "Etapa"}</p>
                  <p className="text-white/70">{node.team1 || "TBD"} vs {node.team2 || "TBD"}</p>
                  <p className="text-white/50">x:{node.x} y:{node.y}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50">
            Arrastra nodos en el área para cambiar su posición y guardar x/y automáticamente.
            {savingNodePositionId ? ` Guardando nodo #${savingNodePositionId}...` : ""}
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            <input value={nodeStage} onChange={(e) => setNodeStage(e.target.value)} placeholder="Etapa (R16, QF...)" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input type="datetime-local" value={nodeDate} onChange={(e) => setNodeDate(e.target.value)} className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={nodeBestOf} onChange={(e) => setNodeBestOf(e.target.value)} placeholder="Best of" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={nodeTeam1} onChange={(e) => setNodeTeam1(e.target.value)} placeholder="Team 1" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={nodeTeam2} onChange={(e) => setNodeTeam2(e.target.value)} placeholder="Team 2" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={nodeX} onChange={(e) => setNodeX(e.target.value)} placeholder="Posición X" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={nodeY} onChange={(e) => setNodeY(e.target.value)} placeholder="Posición Y" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={nodeScore1} onChange={(e) => setNodeScore1(e.target.value)} placeholder="Score 1" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
            <input value={nodeScore2} onChange={(e) => setNodeScore2(e.target.value)} placeholder="Score 2" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg" />
          </div>
          <Button className="w-fit rounded-xl bg-indigo-600 hover:bg-indigo-500" onClick={handleCreateBracketNode}>{editingNodeId ? "Guardar cambios" : "Crear duelo"}</Button>

          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <select value={edgeSourceId} onChange={(e) => setEdgeSourceId(e.target.value)} className="bg-white/5 border border-white/10 text-white p-2 rounded-lg">
              <option value="">Nodo origen</option>
              {bracketNodes.map((node) => <option key={`s-${node.id}`} value={node.id}>#{node.id} {node.team1 || "TBD"} vs {node.team2 || "TBD"}</option>)}
            </select>
            <select value={edgeTargetId} onChange={(e) => setEdgeTargetId(e.target.value)} className="bg-white/5 border border-white/10 text-white p-2 rounded-lg">
              <option value="">Nodo destino</option>
              {bracketNodes.map((node) => <option key={`t-${node.id}`} value={node.id}>#{node.id} {node.stage || "Etapa"}</option>)}
            </select>
          </div>
          <Button className="w-fit rounded-xl" onClick={handleCreateEdge}>Conectar duelos</Button>
          {bracketError && <p className="text-sm text-red-300">{bracketError}</p>}
          <p className="text-xs text-white/60">Duelos actuales: {bracketNodes.length} · Conexiones: {bracketEdges.length}</p>
          <div className="grid gap-2">
            {bracketNodes.map((node) => (
              <div key={node.id} className="rounded-lg border border-white/10 p-2 flex items-center justify-between gap-2">
                <p className="text-xs text-white/70">#{node.id} · {node.stage || "Etapa"} · {node.team1 || "TBD"} vs {node.team2 || "TBD"}</p>
                <div className="flex gap-2">
                  <Button className="rounded-xl" variant="secondary" onClick={() => handleLoadBracketNode(String(node.id))}>Editar</Button>
                  <Button variant="destructive" className="rounded-xl" onClick={() => handleDeleteBracketNode(node.id)}>Eliminar</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 mt-2">
            {bracketEdges.map((edge) => (
              <div key={edge.id} className="rounded-lg border border-white/10 p-2 flex items-center justify-between gap-2">
                <p className="text-xs text-white/70">Conexión #{edge.id}: {edge.source_id} → {edge.target_id}</p>
                <Button variant="destructive" className="rounded-xl" onClick={() => handleDeleteBracketEdge(edge.id)}>Eliminar</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

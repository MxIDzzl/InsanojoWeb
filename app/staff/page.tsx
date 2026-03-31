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

  // Estados existentes
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [savingParticipant, setSavingParticipant] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Estados de noticias
  const [newsList, setNewsList] = useState<{ id: number; title: string; created_at: string }[]>([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImage, setNewsImage] = useState("");
  const [publishingNews, setPublishingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

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
      setRegistrations(regData.registrations ?? []);

      const initialActions: Record<string, Action> = {};
      for (const reg of regData.registrations ?? []) {
        initialActions[reg.id] = { id: reg.id, selectedRole: "participant", loading: false };
      }
      setActions(initialActions);

      // Participantes aceptados
      const partRes = await fetch("/api/participants");
      const partData = await partRes.json();
      setParticipants(partData.participants ?? []);

      // Noticias
      const newsRes = await fetch("/api/news");
      const newsData = await newsRes.json();
      setNewsList(newsData.news ?? []);

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

      {/* ── Solicitudes pendientes ── */}
      {/* ... tu código existente de solicitudes ... */}

      {/* ── Gestión de participantes ── */}
      {/* ... tu código existente de participantes ... */}

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
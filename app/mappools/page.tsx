"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MappoolItem = {
  id: number;
  beatmap_url: string;
  mods: string | null;
  label_color: string | null;
  beatmap_id: number | null;
  title: string | null;
  artist: string | null;
  version: string | null;
  cover_url: string | null;
  star_rating: number | null;
};

type MappoolCollection = {
  id: number;
  title: string;
  stage: string | null;
  accent_color: string | null;
  drive_url: string | null;
  items: MappoolItem[];
};

export default function MappoolsPage() {
  const [mappools, setMappools] = useState<MappoolCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
  });

  async function loadMappools() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/mappools", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo cargar el mappool.");
      setLoading(false);
      return;
    }
    setMappools(data.mappools ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadMappools();
  }, []);

  const gridWidth = useMemo(() => Math.max(1280, mappools.length * 360 + 120), [mappools.length]);
  const maxItems = useMemo(() => Math.max(1, ...mappools.map((pool) => pool.items.length)), [mappools]);
  const gridHeight = Math.max(680, maxItems * 112 + 220);

  if (loading) return <div className="text-white/70">Cargando mappools...</div>;

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Mappools</h1>
      <p className="mt-3 text-white/60">Rueda para zoom y arrastra para navegar libremente.</p>
      {error && <p className="mt-3 text-red-300 text-sm">{error}</p>}

      <div
        className="mt-6 h-[75vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#130d22]/80 to-[#0f1020]/90 cursor-grab active:cursor-grabbing"
        onWheel={(e) => {
          e.preventDefault();
          const next = e.deltaY > 0 ? scale - 0.1 : scale + 0.1;
          setScale(Math.min(2.2, Math.max(0.45, Number(next.toFixed(2)))));
        }}
        onMouseDown={(e) => {
          dragRef.current = { dragging: true, startX: e.clientX - offset.x, startY: e.clientY - offset.y };
        }}
        onMouseMove={(e) => {
          if (!dragRef.current.dragging) return;
          setOffset({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
        }}
        onMouseUp={() => (dragRef.current.dragging = false)}
        onMouseLeave={() => (dragRef.current.dragging = false)}
      >
        <div
          className="relative"
          style={{
            width: gridWidth,
            height: gridHeight,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {mappools.map((pool, colIndex) => {
            const accent = pool.accent_color || "#a855f7";
            return (
              <div key={pool.id} className="absolute" style={{ left: 24 + colIndex * 340, top: 20, width: 320 }}>
                <div className="mb-3 rounded-xl border border-white/15 bg-white/5 p-3" style={{ borderColor: `${accent}66` }}>
                  <p className="font-bold text-white">{pool.title}</p>
                  <p className="text-xs text-white/60">{pool.stage || "Sin etapa"}</p>
                  {pool.drive_url && (
                    <a href={pool.drive_url} target="_blank" rel="noreferrer" className="text-xs text-purple-200 underline">
                      Descargar mappool completo
                    </a>
                  )}
                </div>

                <div className="grid gap-2">
                  {pool.items.map((map) => (
                    <a
                      key={map.id}
                      href={map.beatmap_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative h-[104px] overflow-hidden rounded-lg border border-white/15 bg-white/5"
                    >
                      {map.cover_url && (
                        <img src={map.cover_url} alt={map.title || "cover"} className="absolute inset-0 h-full w-full object-cover opacity-35" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/30" />
                      <div className="relative p-3">
                        <p className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase text-white" style={{ backgroundColor: map.label_color || accent }}>
                          {map.mods || "MOD"}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm font-semibold text-white">{map.title || "Beatmap"}</p>
                        <p className="line-clamp-1 text-xs text-white/75">{map.artist || "Unknown Artist"} · {map.version || "Difficulty"}</p>
                      </div>
                    </a>
                  ))}
                  {pool.items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-white/20 p-3 text-xs text-white/50">Sin mapas en este bloque.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

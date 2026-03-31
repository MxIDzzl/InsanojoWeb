"use client";

import { useEffect, useState } from "react";

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

  if (loading) return <div className="text-white/70">Cargando mappools...</div>;

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Mappools</h1>
      <p className="mt-3 text-white/60"></p>
      {error && <p className="mt-3 text-red-300 text-sm">{error}</p>}

      <div className="mt-8 space-y-6">
        {mappools.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            No hay mappools publicados todavía.
          </div>
        )}

        {mappools.map((pool) => {
          const accent = pool.accent_color || "#a855f7";

          return (
            <section key={pool.id} className="rounded-2xl border border-white/10 bg-[#111522]/85 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10" style={{ borderLeft: `5px solid ${accent}` }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white">{pool.title}</h2>
                    <p className="text-xs text-white/60">{pool.stage || "Sin etapa"}</p>
                  </div>
                  {pool.drive_url && (
                    <a
                      href={pool.drive_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                    >
                      Descargar mappool
                    </a>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-black/35 text-white/70">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Mod</th>
                      <th className="px-3 py-2 text-left font-semibold">Mapa</th>
                      <th className="px-3 py-2 text-left font-semibold">Dificultad</th>
                      <th className="px-3 py-2 text-left font-semibold">Stars</th>
                      <th className="px-3 py-2 text-left font-semibold">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pool.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-white/50">
                          Este bloque todavía no tiene mapas.
                        </td>
                      </tr>
                    ) : (
                      pool.items.map((map) => (
                        <tr key={map.id} className="border-t border-white/10 align-middle hover:bg-white/5">
                          <td className="px-3 py-3">
                            <span
                              className="inline-flex rounded px-2 py-1 text-[11px] font-bold uppercase text-white"
                              style={{ backgroundColor: map.label_color || accent }}
                            >
                              {map.mods || "MOD"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              {map.cover_url ? (
                                <img
                                  src={map.cover_url}
                                  alt={map.title || "cover"}
                                  className="h-10 w-16 rounded object-cover border border-white/20"
                                />
                              ) : (
                                <div className="h-10 w-16 rounded bg-white/10 border border-white/20" />
                              )}
                              <div>
                                <p className="font-semibold text-white">{map.title || "Beatmap"}</p>
                                <p className="text-xs text-white/60">{map.artist || "Unknown Artist"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-white/80">{map.version || "Unknown Difficulty"}</td>
                          <td className="px-3 py-3 text-white/70">
                            {typeof map.star_rating === "number" ? map.star_rating.toFixed(2) : "-"}
                          </td>
                          <td className="px-3 py-3">
                            <a
                              href={map.beatmap_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-200 underline underline-offset-2"
                            >
                              Abrir
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

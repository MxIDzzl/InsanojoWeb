"use client";

import { useEffect, useRef, useState } from "react";

type Beatmap = {
  ID: number;
  Mods?: string;
  BeatmapInfo?: {
    Metadata?: { Title?: string; Artist?: string };
    DifficultyName?: string;
    Covers?: { "card@2x"?: string; "cover@2x"?: string };
  };
};

type Round = {
  Name: string;
  BestOf?: number;
  BanCount?: number;
  Beatmaps: Beatmap[];
};

type BracketData = {
  Rounds: Round[];
};

export default function MappoolsPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    async function load() {
      const res = await fetch("/bracket.json");
      if (!res.ok) return;
      const data: BracketData = await res.json();
      setRounds(data.Rounds ?? []);
    }
    load();
  }, []);

  const cardW = 300;
  const cardH = 95;
  const colW = 340;

  const maxMaps = Math.max(1, ...rounds.map((r) => r.Beatmaps?.length ?? 0));
  const width = Math.max(1200, rounds.length * colW + 100);
  const height = Math.max(700, maxMaps * cardH + 180);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Mappools</h1>
      <p className="mt-3 text-white/60">
        Cargado desde <code>bracket.json</code>. Rueda para zoom, arrastra para moverte libremente.
      </p>

      <div
        className="mt-6 h-[75vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b0712] cursor-grab active:cursor-grabbing"
        onWheel={(e) => {
          e.preventDefault();
          const next = e.deltaY > 0 ? scale - 0.1 : scale + 0.1;
          setScale(Math.min(2.5, Math.max(0.4, Number(next.toFixed(2)))));
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
            width,
            height,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {rounds.map((round, colIndex) => (
            <div key={round.Name} className="absolute" style={{ left: 30 + colIndex * colW, top: 20, width: cardW }}>
              <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-bold text-purple-300">{round.Name}</p>
                <p className="text-xs text-white/60">
                  BO{round.BestOf ?? "-"} · Bans: {round.BanCount ?? 0}
                </p>
              </div>

              <div className="grid gap-2">
                {(round.Beatmaps ?? []).map((map) => {
                  const cover = map.BeatmapInfo?.Covers?.["card@2x"] || map.BeatmapInfo?.Covers?.["cover@2x"];
                  return (
                    <div
                      key={map.ID}
                      className="relative h-[88px] overflow-hidden rounded-lg border border-white/10 bg-white/5"
                    >
                      {cover && (
                        <img
                          src={cover}
                          alt={map.BeatmapInfo?.Metadata?.Title ?? "cover"}
                          className="absolute inset-0 h-full w-full object-cover opacity-35"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/30" />
                      <div className="relative p-3">
                        <p className="text-[10px] text-purple-300 font-semibold uppercase">{map.Mods ?? "MOD"}</p>
                        <p className="text-sm text-white font-semibold line-clamp-1">
                          {map.BeatmapInfo?.Metadata?.Title ?? `Beatmap ${map.ID}`}
                        </p>
                        <p className="text-xs text-white/70 line-clamp-1">
                          {map.BeatmapInfo?.Metadata?.Artist ?? "Unknown Artist"} · {map.BeatmapInfo?.DifficultyName ?? "Difficulty"}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {round.Beatmaps.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/20 p-3 text-xs text-white/50">
                    Sin mappool cargado en esta ronda.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

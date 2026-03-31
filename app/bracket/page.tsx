"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  current: boolean | null;
};

type BracketEdge = {
  id: number;
  source_id: number;
  target_id: number;
};

const CARD_WIDTH = 220;
const CARD_HEIGHT = 108;

export default function BracketPage() {
  const [nodes, setNodes] = useState<BracketNode[]>([]);
  const [edges, setEdges] = useState<BracketEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/bracket", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo cargar el bracket.");
      } else {
        setNodes(data.nodes ?? []);
        setEdges(data.edges ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const nodeMap = useMemo(() => {
    const map = new Map<number, BracketNode>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  const width = Math.max(1400, ...nodes.map((node) => node.x + CARD_WIDTH + 80));
  const height = Math.max(850, ...nodes.map((node) => node.y + CARD_HEIGHT + 80));

  if (loading) return <div className="text-white/70">Cargando bracket...</div>;

  function stageClass(stage: string | null) {
    const value = (stage ?? "").toLowerCase();
    if (value.includes("final")) return "bg-amber-300/20 text-amber-100";
    if (value.includes("semi")) return "bg-cyan-300/20 text-cyan-100";
    if (value.includes("quarter")) return "bg-fuchsia-300/20 text-fuchsia-100";
    if (value.includes("play")) return "bg-emerald-300/20 text-emerald-100";
    return "bg-white/15 text-white";
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Bracket</h1>
      <p className="mt-3 text-white/60">Navega con zoom y desplazamiento libre.</p>
      {nodes.length === 0 && !error && (
        <p className="mt-2 text-sm text-white/60">Aún no hay duelos cargados. Staff puede crearlos desde el panel.</p>
      )}
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      <div
        className="mt-6 h-[75vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1f1632]/90 to-[#181d35]/85 cursor-grab active:cursor-grabbing"
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
            width,
            height,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
            {edges.map((edge) => {
              const source = nodeMap.get(edge.source_id);
              const target = nodeMap.get(edge.target_id);
              if (!source || !target) return null;

              const x1 = source.x + CARD_WIDTH;
              const y1 = source.y + CARD_HEIGHT / 2;
              const x2 = target.x;
              const y2 = target.y + CARD_HEIGHT / 2;
              const midX = (x1 + x2) / 2;

              return (
                <path
                  key={edge.id}
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  stroke="#93c5fd"
                  strokeOpacity="0.9"
                  strokeWidth="3"
                  fill="none"
                />
              );
            })}
          </svg>

          {nodes.map((node) => {
            const stage = node.stage || "Etapa";
            const dateLabel = node.scheduled_at
              ? new Date(node.scheduled_at).toLocaleString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Próximamente";

            return (
              <div
                key={node.id}
                className={`absolute w-[220px] rounded-xl border p-3 backdrop-blur-sm ${
                  node.current ? "border-purple-300/70 bg-purple-500/20" : "border-white/20 bg-slate-900/65"
                }`}
                style={{ left: node.x, top: node.y }}
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-white/70">
                  <span className={`rounded px-2 py-0.5 ${stageClass(stage)}`}>{stage}</span>
                  <span>BO{node.best_of ?? 9}</span>
                </div>
                <div className="mt-2 grid gap-1 text-sm text-white">
                  <div className="flex items-center justify-between rounded bg-white/10 px-2 py-1">
                    <span>{node.team1 || "TBD"}</span>
                    <span>{node.score1 ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/10 px-2 py-1">
                    <span>{node.team2 || "TBD"}</span>
                    <span>{node.score2 ?? 0}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-white/60">{dateLabel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

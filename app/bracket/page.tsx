"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BracketPosition = { X?: number; Y?: number };

type BracketMatch = {
  ID: number;
  Team1Acronym?: string;
  Team2Acronym?: string;
  Team1Score?: number | null;
  Team2Score?: number | null;
  Current?: boolean;
  Position?: BracketPosition;
  PointsToWin?: number;
};

type BracketRound = {
  Name: string;
  Matches: number[];
};

type BracketTeam = {
  Acronym: string;
};

type BracketProgression = {
  SourceID: number;
  TargetID: number;
};

type BracketData = {
  Matches: BracketMatch[];
  Rounds: BracketRound[];
  Teams: BracketTeam[];
  Progressions: BracketProgression[];
};

type Participant = {
  id: string;
  users: { username: string } | null;
};

type User = {
  role: string | null;
};

const CARD_WIDTH = 170;
const CARD_HEIGHT = 66;

export default function BracketPage() {
  const [data, setData] = useState<BracketData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [seeding, setSeeding] = useState<Record<string, string>>({});
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    async function load() {
      const [bracketRes, partRes, meRes] = await Promise.all([
        fetch("/bracket.json"),
        fetch("/api/participants"),
        fetch("/api/auth/me"),
      ]);

      if (bracketRes.ok) {
        const bracketData = await bracketRes.json();
        setData(bracketData);
      }

      if (partRes.ok) {
        const partData = await partRes.json();
        setParticipants(partData.participants ?? []);
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user ?? null);
      }

      const persisted = localStorage.getItem("bracket_seeding");
      if (persisted) {
        try {
          setSeeding(JSON.parse(persisted));
        } catch {
          setSeeding({});
        }
      }
    }

    load();
  }, []);

  useEffect(() => {
    localStorage.setItem("bracket_seeding", JSON.stringify(seeding));
  }, [seeding]);

  const isStaff = user?.role === "owner" || user?.role === "host";

  const roundByMatch = useMemo(() => {
    if (!data) return {} as Record<number, string>;
    const map: Record<number, string> = {};
    for (const round of data.Rounds ?? []) {
      for (const matchId of round.Matches ?? []) {
        map[matchId] = round.Name;
      }
    }
    return map;
  }, [data]);

  const participantOptions = useMemo(
    () => participants.map((p) => p.users?.username ?? `Participante ${p.id.slice(0, 6)}`),
    [participants]
  );

  const slotNames = useMemo(() => {
    const fromTeams = (data?.Teams ?? []).map((t) => t.Acronym).filter(Boolean);
    return Array.from(new Set(fromTeams)).sort((a, b) => a.localeCompare(b));
  }, [data]);

  function resolveTeam(acronym?: string) {
    if (!acronym) return "TBD";
    return seeding[acronym] || acronym;
  }

  function getPosition(match: BracketMatch) {
    const x = match.Position?.X ?? 0;
    const y = match.Position?.Y ?? 0;
    return { x, y };
  }

  if (!data) {
    return <div className="text-white/70">Cargando bracket...</div>;
  }

  const maxX = Math.max(...data.Matches.map((m) => m.Position?.X ?? 0), 0) + 500;
  const maxY = Math.max(...data.Matches.map((m) => m.Position?.Y ?? 0), 0) + 300;

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">Bracket</h1>
      <p className="mt-3 text-white/60">
        Vista cargada desde <code>bracket.json</code>. Usa rueda para zoom y arrastra para moverte.
      </p>

      {isStaff && slotNames.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Asignación de participantes (staff)</p>
          <p className="text-xs text-white/50 mt-1">
            Esto guarda en tu navegador (localStorage) para organizar rápidamente los slots.
          </p>
          <div className="mt-3 grid md:grid-cols-3 gap-2">
            {slotNames.map((slot) => (
              <label key={slot} className="text-sm text-white/70 flex flex-col gap-1">
                {slot}
                <select
                  value={seeding[slot] ?? ""}
                  onChange={(e) =>
                    setSeeding((prev) => ({
                      ...prev,
                      [slot]: e.target.value,
                    }))
                  }
                  className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-white"
                >
                  <option value="">(sin asignar)</option>
                  {participantOptions.map((name) => (
                    <option key={`${slot}-${name}`} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}

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
            width: maxX,
            height: maxY,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg className="absolute inset-0 pointer-events-none" width={maxX} height={maxY}>
            {data.Progressions.map((p) => {
              const source = data.Matches.find((m) => m.ID === p.SourceID);
              const target = data.Matches.find((m) => m.ID === p.TargetID);
              if (!source || !target) return null;
              const s = getPosition(source);
              const t = getPosition(target);
              const x1 = s.x + CARD_WIDTH;
              const y1 = s.y + CARD_HEIGHT / 2;
              const x2 = t.x;
              const y2 = t.y + CARD_HEIGHT / 2;
              const midX = (x1 + x2) / 2;
              return (
                <path
                  key={`${p.SourceID}-${p.TargetID}`}
                  d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
                  stroke="#58d5ff"
                  strokeWidth="3"
                  fill="none"
                />
              );
            })}
          </svg>

          {data.Matches.map((match) => {
            const pos = getPosition(match);
            return (
              <div
                key={match.ID}
                className={`absolute rounded-md border ${match.Current ? "border-purple-400" : "border-white/15"} bg-zinc-900/90 w-[170px]`}
                style={{ left: pos.x, top: pos.y }}
              >
                <div className="px-2 pt-1 text-[10px] uppercase text-white/50">{roundByMatch[match.ID] ?? "Round"}</div>
                <div className="p-2 grid gap-1 text-xs text-white">
                  <div className="flex justify-between bg-white/5 px-2 py-1 rounded">
                    <span>{resolveTeam(match.Team1Acronym)}</span>
                    <span>{match.Team1Score ?? 0}</span>
                  </div>
                  <div className="flex justify-between bg-white/5 px-2 py-1 rounded">
                    <span>{resolveTeam(match.Team2Acronym)}</span>
                    <span>{match.Team2Score ?? 0}</span>
                  </div>
                  <div className="text-[10px] text-white/40">BO{match.PointsToWin ? match.PointsToWin * 2 - 1 : 9}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

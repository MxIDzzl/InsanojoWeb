import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireStaffUser } from "@/lib/staff-auth";

function normalizeHex(color?: string) {
  if (!color) return "#a855f7";
  const cleaned = color.trim();
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : "#a855f7";
}

function normalizeOsuUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (!url.hostname.includes("osu.ppy.sh")) {
    throw new Error("El link debe ser de osu.ppy.sh");
  }

  return url.toString();
}

function extractBeatmapId(url: string) {
  const beatmapsMatch = url.match(/\/beatmaps\/(\d+)/);
  if (beatmapsMatch) return Number(beatmapsMatch[1]);

  const anchorMatch = url.match(/#\w+\/(\d+)/);
  if (anchorMatch) return Number(anchorMatch[1]);

  const shortMatch = url.match(/\/b\/(\d+)/);
  if (shortMatch) return Number(shortMatch[1]);

  const queryMatch = url.match(/[?&]b=(\d+)/);
  if (queryMatch) return Number(queryMatch[1]);

  return null;
}

async function resolveWithOembed(url: string, beatmapId: number | null) {
  const response = await fetch(`https://osu.ppy.sh/oembed?url=${encodeURIComponent(url)}`, {
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await response.json();
  const titleRaw = String(data.title ?? "");
  const [artist = "Unknown Artist", track = "Unknown Title"] = titleRaw
    .split(" - ")
    .map((part: string) => part.trim());

  return {
    beatmap_id: beatmapId,
    artist,
    title: track,
    version: data.author_name ?? "Unknown Difficulty",
    cover_url: data.thumbnail_url ?? null,
    star_rating: null,
  };
}

async function resolveWithOsuApi(beatmapId: number) {
  const clientId = process.env.OSU_CLIENT_ID;
  const clientSecret = process.env.OSU_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const tokenRes = await fetch("https://osu.ppy.sh/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Number(clientId),
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "public",
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) return null;
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) return null;

  const beatmapRes = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!beatmapRes.ok) return null;
  const beatmap = await beatmapRes.json();

  return {
    beatmap_id: beatmapId,
    artist: beatmap.beatmapset?.artist ?? "Unknown Artist",
    title: beatmap.beatmapset?.title ?? "Unknown Title",
    version: beatmap.version ?? "Unknown Difficulty",
    cover_url: beatmap.beatmapset?.covers?.card ?? beatmap.beatmapset?.covers?.cover ?? null,
    star_rating: typeof beatmap.difficulty_rating === "number" ? beatmap.difficulty_rating : null,
  };
}

async function resolveBeatmap(rawBeatmapUrl: string) {
  const normalizedUrl = normalizeOsuUrl(rawBeatmapUrl);
  const beatmapId = extractBeatmapId(normalizedUrl);

  const apiResolved = beatmapId ? await resolveWithOsuApi(beatmapId) : null;
  if (apiResolved) {
    return { beatmap_url: normalizedUrl, ...apiResolved };
  }

  const oembedResolved = await resolveWithOembed(normalizedUrl, beatmapId);
  if (oembedResolved) {
    return { beatmap_url: normalizedUrl, ...oembedResolved };
  }

  throw new Error(
    "No se pudo leer ese link de osu. Usa un enlace directo de beatmap/beatmapset (https://osu.ppy.sh/beatmaps/... o /beatmapsets/...)."
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireStaffUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();

  if (body.type === "create_collection") {
    const { title, stage, accent_color, drive_url } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("mappool_collections")
      .insert({
        title: title.trim(),
        stage: stage?.trim() || null,
        accent_color: normalizeHex(accent_color),
        drive_url: drive_url?.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  }

  if (body.type === "add_item") {
    const { collection_id, beatmap_url, mods, label_color, sort_order } = body;
    if (!collection_id || !beatmap_url?.trim()) {
      return NextResponse.json({ error: "collection_id y beatmap_url son obligatorios." }, { status: 400 });
    }

    let resolved;
    try {
      resolved = await resolveBeatmap(beatmap_url.trim());
    } catch (error: any) {
      return NextResponse.json({ error: error.message ?? "No se pudo resolver beatmap." }, { status: 400 });
    }

    const { error } = await supabase.from("mappool_items").insert({
      collection_id,
      beatmap_url: resolved.beatmap_url,
      mods: mods?.trim() || null,
      label_color: normalizeHex(label_color),
      sort_order: Number(sort_order ?? 0),
      beatmap_id: resolved.beatmap_id,
      title: resolved.title,
      artist: resolved.artist,
      version: resolved.version,
      cover_url: resolved.cover_url,
      star_rating: resolved.star_rating ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Operación no soportada." }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireStaffUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  const tableByType: Record<string, string> = {
    collection: "mappool_collections",
    item: "mappool_items",
  };

  const table = tableByType[type];
  if (!table) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  const { error } = await supabase.from(table).delete().eq("id", Number(id));
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

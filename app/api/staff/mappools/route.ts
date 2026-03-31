import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireStaffUser } from "@/lib/staff-auth";

function normalizeHex(color?: string) {
  if (!color) return "#a855f7";
  const cleaned = color.trim();
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : "#a855f7";
}

async function resolveBeatmap(beatmapUrl: string) {
  const response = await fetch(
    `https://osu.ppy.sh/oembed?url=${encodeURIComponent(beatmapUrl)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("No se pudo resolver el beatmap desde osu.");
  }

  const data = await response.json();
  const title = String(data.title ?? "");
  const [artist = "Unknown Artist", track = "Unknown Title"] = title
    .split(" - ")
    .map((part: string) => part.trim());

  const beatmapId = (() => {
    const match = beatmapUrl.match(/\/beatmaps\/(\d+)/);
    return match ? Number(match[1]) : null;
  })();

  return {
    beatmap_id: beatmapId,
    artist,
    title: track,
    version: data.author_name ?? "Unknown Difficulty",
    cover_url: data.thumbnail_url ?? null,
  };
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
      beatmap_url: beatmap_url.trim(),
      mods: mods?.trim() || null,
      label_color: normalizeHex(label_color),
      sort_order: Number(sort_order ?? 0),
      ...resolved,
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

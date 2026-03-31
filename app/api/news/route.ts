import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireStaffUser } from "@/lib/staff-auth";
import { logStaffAudit } from "@/lib/staff-audit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeUnpublished = searchParams.get("include_unpublished") === "1";

  if (includeUnpublished) {
    const auth = await requireStaffUser();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
  }

  let query = supabase
    .from("news")
    .select("id, title, content, image_url, created_at, publish_at, is_published, is_hidden")
    .order("created_at", { ascending: false });

  if (!includeUnpublished) {
    query = query
      .eq("is_published", true)
      .eq("is_hidden", false)
      .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Error al obtener noticias." }, { status: 500 });
  }

  return NextResponse.json({ news: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireStaffUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const { title, content, image_url, publish_at, is_published, is_hidden } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Título y contenido son obligatorios." }, { status: 400 });
  }

  const publishAtIso = publish_at ? new Date(publish_at).toISOString() : new Date().toISOString();
  const payload = {
    title: title.trim(),
    content: content.trim(),
    image_url: image_url?.trim() || null,
    publish_at: publishAtIso,
    is_published: Boolean(is_published ?? true),
    is_hidden: Boolean(is_hidden),
  };

  const { data, error } = await supabase.from("news").insert(payload).select("id").single();
  if (error) {
    return NextResponse.json({ error: "Error al crear noticia." }, { status: 500 });
  }

  await logStaffAudit({
    actor_id: auth.user.id,
    actor_role: auth.user.role,
    action: "news.created",
    entity_type: "news",
    entity_id: data.id,
    metadata: payload,
  });

  return NextResponse.json({ ok: true, id: data.id });
}

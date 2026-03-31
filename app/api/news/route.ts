import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, content, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error al obtener noticias." }, { status: 500 });
  }

  return NextResponse.json({ news: data });
}

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  let user: any;
  try {
    user = verifySessionToken(token);
  } catch {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  if (user.role !== "owner" && user.role !== "host") {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, image_url } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Título y contenido son obligatorios." }, { status: 400 });
  }

  const { error } = await supabase.from("news").insert({
    title: title.trim(),
    content: content.trim(),
    image_url: image_url?.trim() || null,
  });

  if (error) {
    return NextResponse.json({ error: "Error al crear noticia." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
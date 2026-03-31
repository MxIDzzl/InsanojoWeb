import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let user: any;
  try {
    user = verifySessionToken(token);
  } catch {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json();
  const discord_username = body.discord_username?.trim();

  if (!discord_username) {
    return NextResponse.json({ error: "El usuario de Discord es obligatorio." }, { status: 400 });
  }

  // Verificar que no tenga ya un registro
  const { data: existing } = await supabase
    .from("registrations")
    .select("id")
    .eq("osu_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Ya tienes una solicitud enviada." }, { status: 409 });
  }

  const { error } = await supabase.from("registrations").insert({
    osu_id: user.id,
    discord_username,
  });

  if (error) {
    return NextResponse.json({ error: "Error al guardar el registro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
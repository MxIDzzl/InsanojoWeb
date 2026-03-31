import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET() {
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

  const { data, error } = await supabase
    .from("registrations")
    .select(`
      id,
      osu_id,
      discord_username,
      status,
      created_at,
      users:users!registrations_osu_id_fkey (
        username,
        avatar_url,
        country_code
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Error al obtener registros." }, { status: 500 });
  }

  return NextResponse.json({ registrations: data });
}

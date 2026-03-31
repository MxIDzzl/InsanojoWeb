import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("registrations")
    .select(`
      id,
      osu_id,
      discord_username,
      round,
      eliminated,
      users:users!registrations_osu_id_fkey (
        username,
        avatar_url,
        country_code
      )
    `)
    .eq("status", "accepted")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Error al obtener participantes." }, { status: 500 });
  }

  return NextResponse.json({ participants: data });
}

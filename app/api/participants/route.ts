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
        avatar_url
      )
    `)
    .eq("status", "accepted")
    .order("created_at", { ascending: true });

  if (error) {
    const fallback = await supabase
      .from("registrations")
      .select("id, osu_id, discord_username, round, eliminated")
      .eq("status", "accepted")
      .order("created_at", { ascending: true });

    if (fallback.error) {
      return NextResponse.json(
        { error: `Error al obtener participantes. ${fallback.error.message}` },
        { status: 500 }
      );
    }

    const normalized = (fallback.data ?? []).map((participant) => ({
      ...participant,
      users: null,
    }));

    return NextResponse.json({ participants: normalized });
  }

  return NextResponse.json({ participants: data });
}

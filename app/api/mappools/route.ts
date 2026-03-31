import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: pools, error: poolsError } = await supabase
    .from("mappool_collections")
    .select("id, title, stage, accent_color, drive_url, created_at")
    .order("created_at", { ascending: false });

  if (poolsError) {
    return NextResponse.json({ error: poolsError.message }, { status: 500 });
  }

  const { data: items, error: itemsError } = await supabase
    .from("mappool_items")
    .select(
      "id, collection_id, beatmap_url, mods, label_color, sort_order, beatmap_id, title, artist, version, cover_url, star_rating"
    )
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const withItems = (pools ?? []).map((pool) => ({
    ...pool,
    items: (items ?? []).filter((item) => item.collection_id === pool.id),
  }));

  return NextResponse.json({ mappools: withItems });
}

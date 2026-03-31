import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: nodes, error: nodesError } = await supabase
    .from("bracket_nodes")
    .select("id, stage, scheduled_at, x, y, team1, team2, score1, score2, best_of, current")
    .order("id", { ascending: true });

  if (nodesError) {
    return NextResponse.json({ error: nodesError.message }, { status: 500 });
  }

  const { data: edges, error: edgesError } = await supabase
    .from("bracket_edges")
    .select("id, source_id, target_id")
    .order("id", { ascending: true });

  if (edgesError) {
    return NextResponse.json({ error: edgesError.message }, { status: 500 });
  }

  return NextResponse.json({ nodes: nodes ?? [], edges: edges ?? [] });
}

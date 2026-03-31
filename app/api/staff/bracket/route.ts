import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireStaffUser } from "@/lib/staff-auth";

export async function POST(req: NextRequest) {
  const auth = await requireStaffUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();

  if (body.type === "upsert_node") {
    const { id, stage, scheduled_at, x, y, team1, team2, score1, score2, best_of, current } = body;

    const payload = {
      stage: stage?.trim() || null,
      scheduled_at: scheduled_at || null,
      x: Number(x ?? 0),
      y: Number(y ?? 0),
      team1: team1?.trim() || null,
      team2: team2?.trim() || null,
      score1: Number(score1 ?? 0),
      score2: Number(score2 ?? 0),
      best_of: Number(best_of ?? 9),
      current: Boolean(current),
    };

    const query = supabase.from("bracket_nodes");
    const { error } = id
      ? await query.update(payload).eq("id", id)
      : await query.insert(payload);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.type === "add_edge") {
    const { source_id, target_id } = body;
    if (!source_id || !target_id) {
      return NextResponse.json({ error: "source_id y target_id son obligatorios." }, { status: 400 });
    }

    const { error } = await supabase.from("bracket_edges").insert({ source_id, target_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
  const id = Number(searchParams.get("id"));

  if (!type || !id) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  const table = type === "node" ? "bracket_nodes" : type === "edge" ? "bracket_edges" : null;
  if (!table) return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

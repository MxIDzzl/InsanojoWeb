import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireStaffUser } from "@/lib/staff-auth";
import { logStaffAudit } from "@/lib/staff-audit";

async function authStaff() {
  const auth = await requireStaffUser();
  if ("error" in auth) return auth;
  return auth;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authStaff();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const body = await req.json();
  const payload = {
    title: body.title?.trim(),
    content: body.content?.trim(),
    image_url: body.image_url?.trim() || null,
    publish_at: body.publish_at ? new Date(body.publish_at).toISOString() : null,
    is_published: typeof body.is_published === "boolean" ? body.is_published : undefined,
    is_hidden: typeof body.is_hidden === "boolean" ? body.is_hidden : undefined,
  };

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  const { error } = await supabase.from("news").update(cleanPayload).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Error al actualizar noticia." }, { status: 500 });
  }

  await logStaffAudit({
    actor_id: auth.user.id,
    actor_role: auth.user.role,
    action: "news.updated",
    entity_type: "news",
    entity_id: id,
    metadata: cleanPayload,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authStaff();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Error al eliminar noticia." }, { status: 500 });
  }

  await logStaffAudit({
    actor_id: auth.user.id,
    actor_role: auth.user.role,
    action: "news.deleted",
    entity_type: "news",
    entity_id: id,
  });

  return NextResponse.json({ ok: true });
}

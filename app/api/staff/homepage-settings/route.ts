import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireStaffUser } from "@/lib/staff-auth";
import { DEFAULT_HOMEPAGE_SETTINGS } from "@/lib/homepage-settings";
import { logStaffAudit } from "@/lib/staff-audit";

export async function GET() {
  const auth = await requireStaffUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("config")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ settings: DEFAULT_HOMEPAGE_SETTINGS });
  }

  return NextResponse.json({ settings: data?.config ?? DEFAULT_HOMEPAGE_SETTINGS });
}

export async function POST(req: Request) {
  const auth = await requireStaffUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const settings = body?.settings ?? DEFAULT_HOMEPAGE_SETTINGS;

  const { error } = await supabase
    .from("homepage_settings")
    .upsert({ id: 1, config: settings }, { onConflict: "id" });

  if (error) {
    return NextResponse.json(
      { error: `No se pudo guardar configuración home: ${error.message}` },
      { status: 500 }
    );
  }

  await logStaffAudit({
    actor_id: auth.user.id,
    actor_role: auth.user.role ?? null,
    action: "homepage.settings.updated",
    entity_type: "homepage_settings",
    entity_id: 1,
    metadata: {
      title: settings?.title ?? null,
      twitch_channel: settings?.twitch_channel ?? null,
      twitch_enabled: Boolean(settings?.twitch_enabled),
    },
  });

  return NextResponse.json({ ok: true });
}


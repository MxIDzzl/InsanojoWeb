import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getMaintenanceConfig } from "@/lib/site-maintenance";
import { logStaffAudit } from "@/lib/staff-audit";
import type { SessionUser } from "@/lib/staff-auth";

export async function GET() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  let user: SessionUser;
  try {
    user = verifySessionToken(token) as SessionUser;
  } catch {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  if (user.role !== "owner" && user.role !== "host") {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  const maintenance = await getMaintenanceConfig();
  return NextResponse.json({ maintenance });
}

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  let user: SessionUser;
  try {
    user = verifySessionToken(token) as SessionUser;
  } catch {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  if (user.role !== "owner" && user.role !== "host") {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  const body = await req.json();
  const enabled = Boolean(body.enabled);
  const endsAt = body.ends_at ? new Date(body.ends_at).toISOString() : null;
  const message = body.message?.trim() || null;
  const whitelistText = body.whitelist_text?.trim() || null;
  const template = body.template?.trim() || "default";
  const bannerEnabled = body.banner_enabled !== false;

  const { error } = await supabase.from("site_settings").upsert(
    {
      id: 1,
      maintenance_enabled: enabled,
      maintenance_ends_at: endsAt,
      maintenance_message: message,
      maintenance_whitelist_text: whitelistText,
      maintenance_template: template,
      maintenance_banner_enabled: bannerEnabled,
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json(
      { error: `No se pudo guardar modo mantenimiento: ${error.message}` },
      { status: 500 }
    );
  }

  await logStaffAudit({
    actor_id: user.id,
    actor_role: user.role ?? null,
    action: "maintenance.updated",
    entity_type: "site_settings",
    entity_id: 1,
    metadata: {
      enabled,
      ends_at: endsAt,
      template,
      banner_enabled: bannerEnabled,
    },
  });

  return NextResponse.json({ ok: true });
}

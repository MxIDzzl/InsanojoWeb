import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getMaintenanceConfig } from "@/lib/site-maintenance";

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

  const maintenance = await getMaintenanceConfig();
  return NextResponse.json({ maintenance });
}

export async function POST(req: Request) {
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

  const body = await req.json();
  const enabled = Boolean(body.enabled);
  const endsAt = body.ends_at ? new Date(body.ends_at).toISOString() : null;
  const message = body.message?.trim() || null;

  const { error } = await supabase.from("site_settings").upsert(
    {
      id: 1,
      maintenance_enabled: enabled,
      maintenance_ends_at: endsAt,
      maintenance_message: message,
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json(
      { error: `No se pudo guardar modo mantenimiento: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

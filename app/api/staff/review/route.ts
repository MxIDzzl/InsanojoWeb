import { NextResponse } from "next/server";
import { verifySessionToken, createSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  let staffUser: any;
  try {
    staffUser = verifySessionToken(token);
  } catch {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  if (staffUser.role !== "owner" && staffUser.role !== "host") {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  const body = await req.json();
  const { registration_id, decision, role } = body;

  if (!registration_id || !decision) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  if (decision === "accepted" && !role) {
    return NextResponse.json({ error: "Debes elegir un rol." }, { status: 400 });
  }

  // Obtener el registro para saber el osu_id
  const { data: reg, error: regError } = await supabase
    .from("registrations")
    .select("osu_id")
    .eq("id", registration_id)
    .single();

  if (regError || !reg) {
    return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
  }

  // Actualizar status en registrations
  const { error: updateRegError } = await supabase
    .from("registrations")
    .update({ status: decision })
    .eq("id", registration_id);

  if (updateRegError) {
    return NextResponse.json({ error: "Error al actualizar registro." }, { status: 500 });
  }

  // Si fue aceptado, asignar rol en users
  if (decision === "accepted") {
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("osu_id", reg.osu_id);

    if (updateUserError) {
      return NextResponse.json({ error: "Error al asignar rol." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
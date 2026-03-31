import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

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
  const { registration_id, round, eliminated } = body;

  if (!registration_id) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const { error } = await supabase
    .from("registrations")
    .update({ round, eliminated })
    .eq("id", registration_id);

  if (error) {
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

  const { error } = await supabase
    .from("news")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Error al eliminar noticia." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

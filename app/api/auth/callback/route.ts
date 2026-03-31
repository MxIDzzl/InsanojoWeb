// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  }

  // Intercambiar code por access token
  const tokenRes = await fetch("https://osu.ppy.sh/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.OSU_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/login?error=token_failed", req.url));
  }

  // Obtener datos del usuario desde osu!
  const userRes = await fetch("https://osu.ppy.sh/api/v2/me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/json",
    },
  });

  const userData = await userRes.json();

  // Guardar o actualizar en Supabase (upsert)
  // onConflict: 'osu_id' = si ya existe, actualiza username y avatar
  // pero NO sobreescribe el role (para preservar host/admin asignados)
  const { data: dbUser, error } = await supabase
    .from("users")
    .upsert(
      {
        osu_id: userData.id,
        username: userData.username,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "osu_id",
        ignoreDuplicates: false, // actualiza los campos si ya existe
      }
    )
    .select("osu_id, username, avatar_url, role")
    .single();

  if (error || !dbUser) {
    console.error("Supabase upsert error:", error);
    return NextResponse.redirect(new URL("/login?error=db_error", req.url));
  }

  // Crear sesión con el rol real de la base de datos
  const sessionToken = createSessionToken({
    ...userData,
    role: dbUser.role, // 'participant' | 'host' | 'admin'
  });

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ status: null });

  try {
    const user = verifySessionToken(token) as any;

    const { data } = await supabase
      .from("registrations")
      .select("status")
      .eq("osu_id", user.id)
      .single();

    return NextResponse.json({ status: data?.status ?? "none" });
  } catch {
    return NextResponse.json({ status: null });
  }
}
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.OSU_CLIENT_ID;
  const redirectUri = process.env.OSU_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing OSU_CLIENT_ID or OSU_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const url = new URL("https://osu.ppy.sh/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify");

  return NextResponse.redirect(url.toString());
}
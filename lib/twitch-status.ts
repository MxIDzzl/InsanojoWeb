export type TwitchLiveStatus = {
  isLive: boolean;
  title: string | null;
  gameName: string | null;
  viewerCount: number | null;
};

export async function getTwitchLiveStatus(channelLogin: string): Promise<TwitchLiveStatus> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const appToken = process.env.TWITCH_APP_ACCESS_TOKEN;
  const login = channelLogin.trim();

  if (!clientId || !appToken || !login) {
    return { isLive: false, title: null, gameName: null, viewerCount: null };
  }

  const url = `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(login)}`;
  const res = await fetch(url, {
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${appToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { isLive: false, title: null, gameName: null, viewerCount: null };
  }

  const json = (await res.json()) as {
    data?: Array<{ title?: string; game_name?: string; viewer_count?: number }>;
  };
  const stream = json.data?.[0];
  if (!stream) return { isLive: false, title: null, gameName: null, viewerCount: null };

  return {
    isLive: true,
    title: stream.title ?? null,
    gameName: stream.game_name ?? null,
    viewerCount: typeof stream.viewer_count === "number" ? stream.viewer_count : null,
  };
}


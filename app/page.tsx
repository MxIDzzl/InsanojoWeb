import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { getMaintenanceConfig } from "@/lib/site-maintenance";
import MaintenanceCountdown from "@/components/maintenance-countdown";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { getTwitchLiveStatus } from "@/lib/twitch-status";

type NewsItem = { id: number; title: string; content: string; created_at: string };

export default async function Home() {
  const maintenance = await getMaintenanceConfig();
  const home = await getHomepageSettings();
  const twitch = home.twitch_enabled ? await getTwitchLiveStatus(home.twitch_channel) : null;
  const { data: newsData } = await supabase
    .from("news")
    .select("id, title, content, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  const latestNews = (newsData ?? []) as NewsItem[];

  return (
    <main className="min-h-screen w-full space-y-16 sm:space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-violet-300/20 bg-[#100d23]/85 p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/18 via-transparent to-rose-500/12" />

        {maintenance.maintenance_enabled && maintenance.maintenance_banner_enabled && (
          <div className="relative z-20 mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-200">Modo mantenimiento activo</p>
            <p className="mt-1 text-sm text-white/80">
              {maintenance.maintenance_message ?? "Estamos haciendo mejoras. Volveremos pronto."}
            </p>
            {maintenance.maintenance_ends_at && (
              <MaintenanceCountdown targetDate={maintenance.maintenance_ends_at} />
            )}
          </div>
        )}

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-violet-100/70">{home.eyebrow}</p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
              {home.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/75">
              {home.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-6 py-5">
                <Link href="/login">Iniciar sesión con osu!</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/register">Registrarse</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/bracket">Ver Bracket</Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-violet-300/20 bg-violet-500/10 p-4">
                <p className="text-xs uppercase text-white/50">{home.format_label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{home.format_value}</p>
              </div>
              <div className="rounded-xl border border-violet-300/20 bg-violet-500/10 p-4">
                <p className="text-xs uppercase text-white/50">{home.mode_label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{home.mode_value}</p>
              </div>
              <div className="rounded-xl border border-violet-300/20 bg-violet-500/10 p-4">
                <p className="text-xs uppercase text-white/50">{home.region_label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{home.region_value}</p>
              </div>
              <div className="rounded-xl border border-violet-300/20 bg-violet-500/10 p-4">
                <p className="text-xs uppercase text-white/50">{home.status_label}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">{home.status_value}</p>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-fuchsia-300/25 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-fuchsia-200">
              <span className="inline-block h-2 w-2 rounded-full bg-fuchsia-300" />
              {home.coverage_text}
            </div>
            {home.twitch_enabled && (
              <div className={`mt-3 rounded-md border px-3 py-2 text-xs ${twitch?.isLive ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-200" : "border-white/15 bg-white/5 text-white/70"}`}>
                <p className="font-semibold uppercase tracking-wide">
                  Twitch: {twitch?.isLive ? "En vivo" : "Desconectado"} ({home.twitch_channel})
                </p>
                {twitch?.isLive ? (
                  <p className="mt-1 text-white/80">
                    {twitch.title ?? "Sin descripción"}{twitch.viewerCount ? ` · ${twitch.viewerCount} viewers` : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-white/60">No hay transmisión activa ahora mismo.</p>
                )}
              </div>
            )}
          </div>

          <div className="imc-panel p-5 sm:p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-white">{home.roadmap_title}</h2>
            <div className="mt-4 space-y-3">
              {home.stages.map((phase, index) => (
                <div key={phase.title} className="rounded-xl border border-violet-300/20 bg-violet-500/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-rose-200/90">{phase.label || `Stage ${index + 1}`}</p>
                  <p className="mt-1 font-semibold text-white">{phase.title}</p>
                  <p className="mt-1 text-sm text-white/65">{phase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/rules" className="imc-panel p-5 hover:border-fuchsia-300/40 transition">
          <p className="text-sm font-semibold text-white">Reglamento</p>
          <p className="mt-1 text-sm text-white/65">Reglas oficiales y criterios de match.</p>
        </Link>
        <Link href="/mappools" className="imc-panel p-5 hover:border-fuchsia-300/40 transition">
          <p className="text-sm font-semibold text-white">Mappools</p>
          <p className="mt-1 text-sm text-white/65">Mapas por etapa y mod pool organizado.</p>
        </Link>
        <Link href="/schedule" className="imc-panel p-5 hover:border-fuchsia-300/40 transition">
          <p className="text-sm font-semibold text-white">Calendario</p>
          <p className="mt-1 text-sm text-white/65">Fechas de cada ronda y hitos del torneo.</p>
        </Link>
        <Link href="/staff-list" className="imc-panel p-5 hover:border-fuchsia-300/40 transition">
          <p className="text-sm font-semibold text-white">Equipo Staff</p>
          <p className="mt-1 text-sm text-white/65">Hosts, referees y colaboradores oficiales.</p>
        </Link>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="imc-section-title">Noticias recientes</h2>
            <p className="mt-2 text-sm text-white/65">Comunicados y actualizaciones oficiales del torneo.</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10">
            <Link href="/news">Ver todas</Link>
          </Button>
        </div>

        {latestNews.length === 0 ? (
          <Card className="rounded-2xl border-white/10 bg-white/5">
            <CardContent className="p-6">
              <p className="text-sm text-white/60">Aún no hay noticias publicadas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {latestNews.map((item) => (
              <Card key={item.id} className="rounded-2xl border-white/10 bg-white/5">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wide text-white/45">
                    {new Date(item.created_at).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-4">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { getMaintenanceConfig } from "@/lib/site-maintenance";
import MaintenanceCountdown from "@/components/maintenance-countdown";

type NewsItem = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default async function Home() {
  const maintenance = await getMaintenanceConfig();
  const { data: newsData } = await supabase
    .from("news")
    .select("id, title, content, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  const latestNews = (newsData ?? []) as NewsItem[];

  return (
    <main className="min-h-screen w-full">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {maintenance.maintenance_enabled && maintenance.maintenance_banner_enabled && (
          <div className="relative z-20 max-w-6xl mx-auto px-6 pt-6">
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
              <p className="text-sm font-semibold text-amber-200">Modo mantenimiento activo</p>
              <p className="mt-1 text-sm text-white/80">
                {maintenance.maintenance_message ?? "Estamos haciendo mejoras. Volveremos pronto."}
              </p>
              {maintenance.maintenance_ends_at && (
                <MaintenanceCountdown targetDate={maintenance.maintenance_ends_at} />
              )}
            </div>
          </div>
        )}
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 sm:gap-12 items-center">
          {/* Left side text */}
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/60">
              Torneo competitivo de osu!mania 4K
            </p>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="imc-title-gradient">Insanojo Mania 4K Cup</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/70 max-w-xl">
              Torneo competitivo diseñado para jugadores serios: mappools
              balanceados, calendario organizado y bracket profesional.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                asChild
                className="rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-500 text-white font-semibold px-6 sm:px-7 py-5 sm:py-6 shadow-lg shadow-purple-500/25"
              >
                <Link href="/login">Iniciar sesión con osu!</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white px-6 sm:px-7 py-5 sm:py-6"
              >
                <Link href="/bracket">Ver Bracket</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white px-6 sm:px-7 py-5 sm:py-6"
              >
                <Link href="/rules">Reglas</Link>
              </Button>
            </div>

            {/* Info bar */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
              <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-4">
                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Estado
                </p>
                <p className="text-lg font-bold text-white">Activo</p>
              </div>

              <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-4">
                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Formato
                </p>
                <p className="text-lg font-bold text-white">1v1</p>
              </div>

              <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-4">
                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Modo
                </p>
                <p className="text-lg font-bold text-white">4K</p>
              </div>

              <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-4">
                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Región
                </p>
                <p className="text-lg font-bold text-white">LatAm</p>
              </div>
            </div>
          </div>

          {/* Right side showcase */}
          <div className="relative">
            <div className="rounded-3xl border border-purple-300/20 bg-black/55 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <p className="font-bold text-white tracking-wide">
                  Información del torneo
                </p>

                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                    <p className="text-sm text-white/60">Etapa actual</p>
                    <p className="text-2xl font-bold text-purple-300 mt-1">
                      Qualifiers
                    </p>
                    <p className="text-sm text-white/50 mt-2">
                      Las lobbies y horarios se publicarán en el calendario.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                    <p className="text-sm text-white/60">Próximos matches</p>
                    <p className="text-lg font-semibold text-white mt-1">
                      Round of 16
                    </p>
                    <p className="text-sm text-white/50 mt-2">
                      Revisa el bracket para ver tu rival y el horario.
                    </p>
                  </div>

                  {/* LINKS */}
                  <div className="rounded-2xl bg-gradient-to-r from-purple-600/30 to-fuchsia-600/10 border border-purple-400/20 p-5">
                    <p className="text-sm text-white/60">Enlaces principales</p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <a
                        href="https://osu.ppy.sh/community/forums/topics/2191185?n=1"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold text-white"
                      >
                        Foro osu!
                      </a>

                      <a
                        href="https://docs.google.com/document/d/1Q3kYDQZYD2x0lrlxNk_g9NnuYrf2WDcaGpB-8AggCt4"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold text-white"
                      >
                        Docs
                      </a>

                      <a
                        href="https://www.twitch.tv/vexxnx"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold text-white"
                      >
                        Livestream
                      </a>
                    </div>
                  </div>

                  {/* EXTRA MINI STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                      <p className="text-xs text-white/50">Bans</p>
                      <p className="font-bold text-white mt-1">1</p>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                      <p className="text-xs text-white/50">Best of</p>
                      <p className="font-bold text-white mt-1">7</p>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                      <p className="text-xs text-white/50">Mods</p>
                      <p className="font-bold text-white mt-1">Freemod</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* subtle border glow */}
            <div className="absolute inset-0 rounded-3xl border border-purple-500/10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* SKILLSETS */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Categorías del Mappool
            </h2>
            <p className="mt-2 text-white/60 max-w-xl">
              Mappool diseñado con categorías inspiradas en elementos competitivos:
              Speed, Rice, Hybrid, LN, Tech y TB.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
          >
            <Link href="/mappools">Ver Mappools</Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="bg-red-500/20 border-red-500/30 rounded-2xl">
            <CardContent className="p-4 text-center font-bold text-red-300">
              Speed
            </CardContent>
          </Card>

          <Card className="bg-orange-500/20 border-orange-500/30 rounded-2xl">
            <CardContent className="p-4 text-center font-bold text-orange-300">
              Rice
            </CardContent>
          </Card>

          <Card className="bg-green-500/20 border-green-500/30 rounded-2xl">
            <CardContent className="p-4 text-center font-bold text-green-300">
              Hybrid
            </CardContent>
          </Card>

          <Card className="bg-blue-500/20 border-blue-500/30 rounded-2xl">
            <CardContent className="p-4 text-center font-bold text-blue-300">
              LN
            </CardContent>
          </Card>

          <Card className="bg-purple-500/20 border-purple-500/30 rounded-2xl">
            <CardContent className="p-4 text-center font-bold text-purple-300">
              Tech
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 rounded-2xl">
            <CardContent className="p-4 text-center font-bold text-white">
              TB
            </CardContent>
          </Card>
        </div>
      </section>

      {/* NOTICIAS */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Noticias
            </h2>
            <p className="mt-2 text-white/60 max-w-2xl">
              Actualizaciones importantes del torneo, cambios en reglas, anuncios
              y publicación de mappools.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
          >
            <Link href="/news">Ver todas</Link>
          </Button>
        </div>

        {latestNews.length === 0 ? (
          <Card className="mt-10 rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-6">
              <p className="text-sm text-white/60">Aún no hay noticias publicadas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {latestNews.map((item) => (
              <Card key={item.id} className="rounded-2xl bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <p className="text-xs text-white/50 uppercase tracking-wide">
                    {new Date(item.created_at).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-3">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* PREMIOS / STAFF / FAQ */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Información general
        </h2>

        <p className="mt-2 text-white/60 max-w-2xl">
          Apartados principales para mantener todo el torneo organizado y fácil
          de consultar.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-purple-300">Premios</h3>
              <p className="mt-2 text-sm text-white/70">
                Consulta la distribución de premios y recompensas del torneo.
              </p>

              <Button
                asChild
                variant="outline"
                className="mt-5 rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
              >
                <Link href="/prizes">Ver premios</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-purple-300">Staff</h3>
              <p className="mt-2 text-sm text-white/70">
                Lista oficial de organizadores, referees, mappoolers y streamers.
              </p>

              <Button
                asChild
                variant="outline"
                className="mt-5 rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
              >
                <Link href="/staff-list">Ver staff</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-purple-300">FAQ</h3>
              <p className="mt-2 text-sm text-white/70">
                Preguntas frecuentes sobre registro, reglas, mappools y formato.
              </p>

              <Button
                asChild
                variant="outline"
                className="mt-5 rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
              >
                <Link href="/faq">Ver FAQ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

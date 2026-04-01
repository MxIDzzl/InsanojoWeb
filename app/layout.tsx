import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { cookies, headers } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getMaintenanceConfig } from "@/lib/site-maintenance";
import MaintenanceCountdown from "@/components/maintenance-countdown";

export const metadata: Metadata = {
  title: "Insanojo Mania 4K Cup",
  description: "Torneo competitivo de osu!mania 4K",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const maintenance = await getMaintenanceConfig();
  const cookieStore = await cookies();
  const headerStore = await headers();
  const token = cookieStore.get("session")?.value;

  let isStaff = false;
  let sessionUser: { id?: number; username?: string } | null = null;
  if (token) {
    try {
      const user = verifySessionToken(token) as { role?: string | null; id?: number; username?: string };
      sessionUser = user;
      isStaff = user?.role === "owner" || user?.role === "host";
    } catch {
      isStaff = false;
      sessionUser = null;
    }
  }

  const forwardedFor = headerStore.get("x-forwarded-for") ?? "";
  const requestIp = forwardedFor.split(",")[0]?.trim() || null;
  const whitelist = (maintenance.maintenance_whitelist_text ?? "")
    .split(/[\n,]/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const whitelisted =
    Boolean(sessionUser?.id && whitelist.includes(String(sessionUser.id).toLowerCase())) ||
    Boolean(sessionUser?.username && whitelist.includes(sessionUser.username.toLowerCase())) ||
    Boolean(requestIp && whitelist.includes(requestIp.toLowerCase()));

  const maintenanceEnabledForUser = maintenance.maintenance_enabled && !isStaff && !whitelisted;
  const template = maintenance.maintenance_template ?? "default";
  const templateClasses =
    template === "warning"
      ? "rounded-2xl border border-amber-400/30 bg-amber-500/10 p-8"
      : template === "minimal"
        ? "rounded-2xl border border-white/10 bg-black/25 p-8"
        : "rounded-2xl border border-purple-400/20 bg-purple-500/10 p-8";

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#05010a] text-white">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500/70 via-fuchsia-400/70 to-rose-400/70" />
        {!maintenanceEnabledForUser && <Navbar />}

        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="pointer-events-none absolute inset-0 -z-10 imc-grid-lines opacity-[0.08]" />
          {maintenanceEnabledForUser ? (
            <div className={`py-20 ${templateClasses} imc-panel`}>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Sitio en mantenimiento</h1>
              <p className="mt-4 text-white/70 max-w-2xl">
                {maintenance.maintenance_message ??
                  "Estamos realizando ajustes. Por favor vuelve en unos minutos."}
              </p>
              {maintenance.maintenance_ends_at && (
                <MaintenanceCountdown targetDate={maintenance.maintenance_ends_at} />
              )}
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="w-full border-t border-violet-300/15 mt-16 bg-[#0b0915]/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-white/50 flex flex-col sm:flex-row gap-2 justify-between">
            <p>© {new Date().getFullYear()} Insanojo Mania 4K Cup</p>
            <p className="text-violet-200/70 uppercase tracking-wide text-xs">Website by Vexx</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

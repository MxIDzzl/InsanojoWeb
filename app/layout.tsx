import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { cookies } from "next/headers";
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
  const token = cookieStore.get("session")?.value;

  let isStaff = false;
  if (token) {
    try {
      const user: any = verifySessionToken(token);
      isStaff = user?.role === "owner" || user?.role === "host";
    } catch {
      isStaff = false;
    }
  }

  const maintenanceEnabledForUser = maintenance.maintenance_enabled && !isStaff;

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#05010a] text-white">
        {!maintenanceEnabledForUser && <Navbar />}

        <main className="max-w-6xl mx-auto px-6 py-10">
          {maintenanceEnabledForUser ? (
            <div className="py-20">
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

        <footer className="w-full border-t border-white/10 mt-16 bg-black/30">
          <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-white/50 flex justify-between">
            <p>© {new Date().getFullYear()} Insanojo Mania 4K Cup</p>
            <p className="text-purple-300/70">Website by Vexx</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

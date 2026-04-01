import { supabase } from "@/lib/supabase";

export type HomepageStage = {
  label: string;
  title: string;
  description: string;
};

export type HomepageSettings = {
  eyebrow: string;
  title: string;
  description: string;
  format_label: string;
  format_value: string;
  mode_label: string;
  mode_value: string;
  region_label: string;
  region_value: string;
  status_label: string;
  status_value: string;
  coverage_text: string;
  roadmap_title: string;
  twitch_channel: string;
  twitch_enabled: boolean;
  stages: HomepageStage[];
};

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  eyebrow: "osu!mania 4K Tournament",
  title: "Insanojo Mania Cup",
  description:
    "Plataforma oficial del torneo: registro, fixtures, mappools y bracket en un solo lugar para jugadores y staff.",
  format_label: "Formato",
  format_value: "1v1",
  mode_label: "Modo",
  mode_value: "osu!mania 4K",
  region_label: "Región",
  region_value: "LatAm",
  status_label: "Estado",
  status_value: "Activo",
  coverage_text: "Broadcast & Match Coverage Activo",
  roadmap_title: "Match Roadmap",
  twitch_channel: "vexxnx",
  twitch_enabled: true,
  stages: [
    { label: "Stage 1", title: "Registros", description: "Inscripciones y revisión de elegibilidad" },
    { label: "Stage 2", title: "Qualifiers", description: "Siembra inicial para el bracket principal" },
    { label: "Stage 3", title: "Playoffs", description: "Eliminación directa con cobertura del staff" },
    { label: "Stage 4", title: "Finales", description: "Definición del campeón y premiación" },
  ],
};

function normalizeSettings(raw: Partial<HomepageSettings> | null | undefined): HomepageSettings {
  const safeStages = Array.isArray(raw?.stages)
    ? raw!.stages.filter(Boolean).slice(0, 8).map((stage, idx) => ({
        label: stage?.label?.trim() || `Stage ${idx + 1}`,
        title: stage?.title?.trim() || `Fase ${idx + 1}`,
        description: stage?.description?.trim() || "Sin descripción.",
      }))
    : DEFAULT_HOMEPAGE_SETTINGS.stages;

  return {
    ...DEFAULT_HOMEPAGE_SETTINGS,
    ...raw,
    stages: safeStages.length > 0 ? safeStages : DEFAULT_HOMEPAGE_SETTINGS.stages,
  };
}

export async function getHomepageSettings() {
  const { data, error } = await supabase
    .from("homepage_settings")
    .select("config")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return DEFAULT_HOMEPAGE_SETTINGS;
  }

  return normalizeSettings((data?.config as Partial<HomepageSettings> | null) ?? null);
}


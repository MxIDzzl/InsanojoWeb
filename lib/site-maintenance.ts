import { supabase } from "@/lib/supabase";

export type MaintenanceConfig = {
  maintenance_enabled: boolean;
  maintenance_ends_at: string | null;
  maintenance_message: string | null;
  maintenance_whitelist_text: string | null;
  maintenance_template: string | null;
  maintenance_banner_enabled: boolean;
};

export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "maintenance_enabled, maintenance_ends_at, maintenance_message, maintenance_whitelist_text, maintenance_template, maintenance_banner_enabled"
    )
    .eq("id", 1)
    .single();

  if (error || !data) {
    return {
      maintenance_enabled: false,
      maintenance_ends_at: null,
      maintenance_message: null,
      maintenance_whitelist_text: null,
      maintenance_template: "default",
      maintenance_banner_enabled: true,
    };
  }

  return {
    maintenance_enabled: Boolean(data.maintenance_enabled),
    maintenance_ends_at: data.maintenance_ends_at ?? null,
    maintenance_message: data.maintenance_message ?? null,
    maintenance_whitelist_text: data.maintenance_whitelist_text ?? null,
    maintenance_template: data.maintenance_template ?? "default",
    maintenance_banner_enabled: Boolean(data.maintenance_banner_enabled ?? true),
  };
}

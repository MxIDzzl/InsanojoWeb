import { supabase } from "@/lib/supabase";

export type MaintenanceConfig = {
  maintenance_enabled: boolean;
  maintenance_ends_at: string | null;
  maintenance_message: string | null;
};

export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("maintenance_enabled, maintenance_ends_at, maintenance_message")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return {
      maintenance_enabled: false,
      maintenance_ends_at: null,
      maintenance_message: null,
    };
  }

  return data as MaintenanceConfig;
}

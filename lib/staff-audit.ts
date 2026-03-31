import { supabase } from "@/lib/supabase";

type AuditEntry = {
  actor_id?: number | null;
  actor_role?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | number | null;
  metadata?: Record<string, unknown> | null;
};

export async function logStaffAudit(entry: AuditEntry) {
  const payload = {
    actor_id: entry.actor_id ?? null,
    actor_role: entry.actor_role ?? null,
    action: entry.action,
    entity_type: entry.entity_type ?? null,
    entity_id: entry.entity_id ? String(entry.entity_id) : null,
    metadata: entry.metadata ?? null,
  };

  const { error } = await supabase.from("staff_audit_log").insert(payload);
  if (error) {
    // Best effort: el flujo principal no debe romperse si la tabla aún no existe.
    console.warn("staff_audit_log insert failed:", error.message);
  }
}

import { supabase } from "@/integrations/supabase/client";

export type LogActivityParams = {
  actorId: string;
  patientId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logActivity({
  actorId,
  patientId,
  action,
  resourceType,
  resourceId = null,
  metadata = {},
}: LogActivityParams) {
  try {
    const { error } = await supabase.from("activity_logs").insert({
      actor_id: actorId,
      patient_id: patientId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: metadata as any,
    });
    if (error) {
      console.warn("[ActivityLog] Failed to insert log:", error.message);
    }
  } catch (err) {
    console.warn("[ActivityLog] Unexpected error:", err);
  }
}

import { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

type CaregiverPermission = Database["public"]["Enums"]["caregiver_permission"];

const PERMISSION_OPTIONS: { id: CaregiverPermission; label: string; description: string }[] = [
  { id: "VIEW_MEMORIES", label: "View Memories", description: "Read moments, places, objects, and people in the library." },
  { id: "ADD_MEMORIES", label: "Add Memories", description: "Create new memories, places, and objects for the patient." },
  { id: "EDIT_MEMORIES", label: "Edit Memories", description: "Update details of existing memories and places." },
  { id: "DELETE_MEMORIES", label: "Delete Memories", description: "Remove memories, places, or objects." },
  { id: "MANAGE_PEOPLE", label: "Manage People", description: "Add, edit, or remove familiar faces and relationship details." },
  { id: "VIEW_ACTIVITY", label: "View Activity", description: "Access audit activity logs and conversation history." },
];

export function CaregiverPermissionsModal({
  open,
  onOpenChange,
  caregiverLink,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiverLink: {
    id: string;
    caregiver_email: string;
    caregiver_name: string | null;
    patient_id: string;
  } | null;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permissionsMap, setPermissionsMap] = useState<Record<CaregiverPermission, boolean>>({
    VIEW_MEMORIES: false,
    ADD_MEMORIES: false,
    EDIT_MEMORIES: false,
    DELETE_MEMORIES: false,
    MANAGE_PEOPLE: false,
    VIEW_ACTIVITY: false,
  });

  useEffect(() => {
    if (!open || !caregiverLink) return;

    let active = true;
    async function loadPermissions() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("caregiver_permissions")
          .select("permission, enabled")
          .eq("caregiver_link_id", caregiverLink!.id);

        if (error) throw error;

        const nextMap: Record<CaregiverPermission, boolean> = {
          VIEW_MEMORIES: false,
          ADD_MEMORIES: false,
          EDIT_MEMORIES: false,
          DELETE_MEMORIES: false,
          MANAGE_PEOPLE: false,
          VIEW_ACTIVITY: false,
        };

        (data ?? []).forEach((row) => {
          if (row.permission in nextMap) {
            nextMap[row.permission as CaregiverPermission] = row.enabled;
          }
        });

        if (active) {
          setPermissionsMap(nextMap);
        }
      } catch (err) {
        toast.error("Failed to load caregiver permissions.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPermissions();
    return () => {
      active = false;
    };
  }, [open, caregiverLink]);

  function togglePermission(perm: CaregiverPermission) {
    setPermissionsMap((prev) => ({ ...prev, [perm]: !prev[perm] }));
  }

  async function handleSave() {
    if (!caregiverLink) return;
    setBusy(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const patientId = userData.user?.id || caregiverLink.patient_id;

      // Upsert permissions for this caregiver_link_id
      const upsertRows = PERMISSION_OPTIONS.map((p) => ({
        caregiver_link_id: caregiverLink.id,
        permission: p.id,
        enabled: permissionsMap[p.id] ?? false,
      }));

      const { error } = await supabase
        .from("caregiver_permissions")
        .upsert(upsertRows, { onConflict: "caregiver_link_id,permission" });

      if (error) throw error;

      await logActivity({
        actorId: patientId,
        patientId,
        action: "permission_updated",
        resourceType: "caregiver_permissions",
        resourceId: caregiverLink.id,
        metadata: {
          caregiver_email: caregiverLink.caregiver_email,
          permissions: permissionsMap,
        },
      });

      toast.success("Caregiver permissions updated successfully.");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save permissions.");
    } finally {
      setBusy(false);
    }
  }

  const titleName = caregiverLink?.caregiver_name || caregiverLink?.caregiver_email || "Caregiver";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl">Manage Permissions</DialogTitle>
              <DialogDescription className="text-xs truncate max-w-xs">
                {titleName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {PERMISSION_OPTIONS.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/30"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-foreground block">
                    {perm.label}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {perm.description}
                  </span>
                </div>
                <Switch
                  checked={permissionsMap[perm.id]}
                  onCheckedChange={() => togglePermission(perm.id)}
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={busy || loading} className="rounded-xl gap-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

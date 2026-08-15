import { useState } from "react";
import { Loader2, Mail, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CaregiverPermission = Database["public"]["Enums"]["caregiver_permission"];

const PERMISSION_OPTIONS: { id: CaregiverPermission; label: string; description: string }[] = [
  { id: "VIEW_MEMORIES", label: "View Memories", description: "Read moments, places, objects, and people in the library." },
  { id: "ADD_MEMORIES", label: "Add Memories", description: "Create new memories, places, and objects for the patient." },
  { id: "EDIT_MEMORIES", label: "Edit Memories", description: "Update details of existing memories and places." },
  { id: "DELETE_MEMORIES", label: "Delete Memories", description: "Remove memories, places, or objects." },
  { id: "MANAGE_PEOPLE", label: "Manage People", description: "Add, edit, or remove familiar faces and relationship details." },
  { id: "VIEW_ACTIVITY", label: "View Activity", description: "Access the audit activity log and conversation timeline." },
];

export function CaregiverInviteModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<CaregiverPermission, boolean>>({
    VIEW_MEMORIES: true,
    ADD_MEMORIES: true,
    EDIT_MEMORIES: true,
    DELETE_MEMORIES: false,
    MANAGE_PEOPLE: true,
    VIEW_ACTIVITY: true,
  });

  function togglePermission(perm: CaregiverPermission) {
    setSelectedPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const patientId = userData.user?.id;
      if (!patientId) throw new Error("Not authenticated");

      // 1. Create caregiver link record with status pending
      const { data: link, error: linkError } = await supabase
        .from("caregivers")
        .insert({
          patient_id: patientId,
          caregiver_email: email.trim().toLowerCase(),
          caregiver_name: name.trim() || null,
          status: "pending",
        })
        .select()
        .single();

      if (linkError) throw linkError;

      // 2. Insert initial caregiver permissions
      const permInserts = PERMISSION_OPTIONS.map((p) => ({
        caregiver_link_id: link.id,
        permission: p.id,
        enabled: selectedPermissions[p.id] ?? false,
      }));

      const { error: permError } = await supabase.from("caregiver_permissions").insert(permInserts);
      if (permError) throw permError;

      // 3. Log activity
      await logActivity({
        actorId: patientId,
        patientId,
        action: "caregiver_invited",
        resourceType: "caregiver",
        resourceId: link.id,
        metadata: { caregiver_email: email, caregiver_name: name },
      });

      toast.success(`Invitation sent to ${email}. Access requires acceptance.`);
      setEmail("");
      setName("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl">Invite a Caregiver</DialogTitle>
              <DialogDescription className="text-xs">
                They will receive an invitation to assist with your memory library.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSendInvite} className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="caregiver-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Caregiver Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                id="caregiver-email"
                type="email"
                required
                placeholder="anita.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-9 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caregiver-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name (Optional)
            </Label>
            <Input
              id="caregiver-name"
              type="text"
              placeholder="Anita Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Initial Permissions
              </Label>
              <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                <Shield className="size-3 text-teal" />
                Granular control
              </span>
            </div>

            <div className="space-y-2.5 rounded-xl border border-border bg-accent/30 p-3.5">
              {PERMISSION_OPTIONS.map((perm) => (
                <div key={perm.id} className="flex items-start gap-3 py-1">
                  <Checkbox
                    id={`perm-${perm.id}`}
                    checked={selectedPermissions[perm.id]}
                    onCheckedChange={() => togglePermission(perm.id)}
                    className="mt-0.5 rounded-md"
                  />
                  <label htmlFor={`perm-${perm.id}`} className="grid gap-0.5 text-xs cursor-pointer select-none">
                    <span className="font-semibold text-foreground">{perm.label}</span>
                    <span className="text-muted-foreground">{perm.description}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="rounded-xl">
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

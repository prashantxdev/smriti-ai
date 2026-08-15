import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Mail,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity";
import { RequireAccess } from "@/lib/access";
import { PageHeader } from "@/components/app/PageHeader";
import { CaregiverInviteModal } from "@/components/app/CaregiverInviteModal";
import { CaregiverPermissionsModal } from "@/components/app/CaregiverPermissionsModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/caregivers")({
  head: () => ({
    meta: [
      { title: "Caregivers — Smriti AI" },
      {
        name: "description",
        content: "Invite trusted caregivers and manage granular access permissions to your memory library.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CaregiversPage,
});

type CaregiverStatus = Database["public"]["Enums"]["caregiver_status"];
type CaregiverPermission = Database["public"]["Enums"]["caregiver_permission"];

type CaregiverLink = {
  id: string;
  patient_id: string;
  caregiver_id: string | null;
  caregiver_email: string;
  caregiver_name: string | null;
  status: CaregiverStatus;
  created_at: string;
  updated_at: string;
  caregiver_permissions: { permission: CaregiverPermission; enabled: boolean }[];
  patient_profile?: { name: string; email: string | null } | null;
};

function CaregiversPage() {
  return (
    <RequireAccess area="caregivers">
      <CaregiversContent />
    </RequireAccess>
  );
}

function CaregiversContent() {
  const queryClient = useQueryClient();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<CaregiverLink | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  // Load patient's caregivers (where current user is patient)
  const patientCaregivers = useQuery<CaregiverLink[]>({
    queryKey: ["caregivers", "my-caregivers"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from("caregivers")
        .select("*, caregiver_permissions(permission, enabled)")
        .eq("patient_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CaregiverLink[];
    },
  });

  // Load incoming caregiver invitations (where current user is caregiver)
  const incomingInvitations = useQuery<CaregiverLink[]>({
    queryKey: ["caregivers", "incoming-invitations"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const userEmail = userData.user?.email;
      if (!userId && !userEmail) return [];

      let query = supabase
        .from("caregivers")
        .select("*, caregiver_permissions(permission, enabled)")
        .or(`caregiver_id.eq.${userId}${userEmail ? `,caregiver_email.ilike.${userEmail}` : ""}`);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as CaregiverLink[];
    },
  });

  async function handleRevoke(link: CaregiverLink) {
    if (!confirm(`Are you sure you want to revoke access for ${link.caregiver_email}?`)) return;
    setActionBusyId(link.id);
    try {
      const { error } = await supabase
        .from("caregivers")
        .update({ status: "revoked" })
        .eq("id", link.id);

      if (error) throw error;

      await logActivity({
        actorId: link.patient_id,
        patientId: link.patient_id,
        action: "caregiver_revoked",
        resourceType: "caregiver",
        resourceId: link.id,
        metadata: { caregiver_email: link.caregiver_email },
      });

      toast.success(`Revoked access for ${link.caregiver_email}`);
      await queryClient.invalidateQueries({ queryKey: ["caregivers"] });
      await queryClient.invalidateQueries({ queryKey: ["access"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke caregiver.");
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleResend(link: CaregiverLink) {
    setActionBusyId(link.id);
    try {
      toast.success(`Resent invitation email to ${link.caregiver_email}`);
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleAccept(link: CaregiverLink) {
    setActionBusyId(link.id);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("caregivers")
        .update({ status: "accepted", caregiver_id: userId })
        .eq("id", link.id);

      if (error) throw error;

      await logActivity({
        actorId: userId,
        patientId: link.patient_id,
        action: "caregiver_accepted",
        resourceType: "caregiver",
        resourceId: link.id,
        metadata: { caregiver_email: link.caregiver_email },
      });

      toast.success("Invitation accepted! You can now assist this patient according to permissions.");
      await queryClient.invalidateQueries({ queryKey: ["caregivers"] });
      await queryClient.invalidateQueries({ queryKey: ["access"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invitation.");
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleDecline(link: CaregiverLink) {
    setActionBusyId(link.id);
    try {
      const { error } = await supabase
        .from("caregivers")
        .update({ status: "declined" })
        .eq("id", link.id);

      if (error) throw error;

      toast.success("Invitation declined.");
      await queryClient.invalidateQueries({ queryKey: ["caregivers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to decline invitation.");
    } finally {
      setActionBusyId(null);
    }
  }

  function openPermissionsModal(link: CaregiverLink) {
    setSelectedLink(link);
    setPermissionModalOpen(true);
  }

  function refreshData() {
    void queryClient.invalidateQueries({ queryKey: ["caregivers"] });
    void queryClient.invalidateQueries({ queryKey: ["access"] });
  }

  return (
    <div>
      <PageHeader
        title="Caregivers & Permissions"
        description="Invite family members or trusted caregivers, set explicit data boundaries, and audit access."
        action={
          <Button onClick={() => setInviteModalOpen(true)} className="rounded-full gap-2">
            <UserPlus className="size-4" />
            Invite Caregiver
          </Button>
        }
      />

      <Tabs defaultValue="my-caregivers" className="mt-8">
        <TabsList className="rounded-xl bg-card border border-border p-1">
          <TabsTrigger value="my-caregivers" className="rounded-lg gap-2">
            <ShieldCheck className="size-4" />
            My Caregivers ({patientCaregivers.data?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="incoming" className="rounded-lg gap-2">
            <Mail className="size-4" />
            Invitations ({incomingInvitations.data?.filter((i) => i.status === "pending").length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* My Caregivers Tab */}
        <TabsContent value="my-caregivers" className="mt-6 space-y-4">
          {patientCaregivers.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : patientCaregivers.data?.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserCheck className="size-7" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">No caregivers invited yet</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                You control your memory library completely. Invite a trusted family member or helper to view or assist with your memories.
              </p>
              <Button onClick={() => setInviteModalOpen(true)} className="mt-6 rounded-full gap-2">
                <Plus className="size-4" />
                Invite Caregiver Now
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {patientCaregivers.data?.map((link) => (
                <div
                  key={link.id}
                  className="surface-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {link.caregiver_name || link.caregiver_email}
                      </h3>
                      <StatusBadge status={link.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{link.caregiver_email}</p>

                    {/* Permissions tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {link.caregiver_permissions
                        ?.filter((p) => p.enabled)
                        .map((p) => (
                          <Badge
                            key={p.permission}
                            variant="secondary"
                            className="rounded-md px-2 py-0.5 text-[0.65rem] font-medium"
                          >
                            ✓ {formatPermission(p.permission)}
                          </Badge>
                        ))}
                      {link.caregiver_permissions?.filter((p) => p.enabled).length === 0 && (
                        <span className="text-xs italic text-muted-foreground">No active permissions</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 sm:border-t-0 sm:pt-0">
                    {link.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleResend(link)}
                          disabled={actionBusyId === link.id}
                          className="rounded-xl text-xs gap-1.5"
                        >
                          <RefreshCw className="size-3.5" />
                          Resend
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void handleAccept(link)}
                          disabled={actionBusyId === link.id}
                          className="rounded-xl text-xs gap-1.5 bg-teal/10 text-teal hover:bg-teal/20"
                          title="Simulate caregiver acceptance locally"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Simulate Accept
                        </Button>
                      </>
                    )}

                    {link.status === "accepted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPermissionsModal(link)}
                        className="rounded-xl text-xs gap-1.5"
                      >
                        <Shield className="size-3.5 text-primary" />
                        Edit Permissions
                      </Button>
                    )}

                    {link.status !== "revoked" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleRevoke(link)}
                        disabled={actionBusyId === link.id}
                        className="rounded-xl text-xs gap-1.5"
                      >
                        <UserX className="size-3.5" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Incoming Invitations Tab */}
        <TabsContent value="incoming" className="mt-6 space-y-4">
          {incomingInvitations.isPending ? (
            <Skeleton className="h-28 w-full rounded-2xl" />
          ) : incomingInvitations.data?.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Mail className="size-7" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">No pending invitations</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                When someone invites you as a caregiver, their request will appear here for your acceptance.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {incomingInvitations.data?.map((link) => (
                <div
                  key={link.id}
                  className="surface-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-base font-semibold">
                        Caregiver request for {link.caregiver_email}
                      </h3>
                      <StatusBadge status={link.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Received {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {link.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => void handleAccept(link)}
                        disabled={actionBusyId === link.id}
                        className="rounded-xl text-xs gap-1.5"
                      >
                        <CheckCircle2 className="size-4" />
                        Accept Invitation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDecline(link)}
                        disabled={actionBusyId === link.id}
                        className="rounded-xl text-xs gap-1.5"
                      >
                        <XCircle className="size-4" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CaregiverInviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onSuccess={refreshData}
      />
      <CaregiverPermissionsModal
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        caregiverLink={selectedLink}
        onSuccess={refreshData}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: CaregiverStatus }) {
  if (status === "accepted") {
    return (
      <Badge className="rounded-full bg-teal/15 text-teal hover:bg-teal/20 border-0 gap-1 text-[0.7rem]">
        <CheckCircle2 className="size-3" />
        Accepted
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge variant="outline" className="rounded-full border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-[0.7rem]">
        <Clock className="size-3" />
        Pending
      </Badge>
    );
  }
  if (status === "declined") {
    return (
      <Badge variant="outline" className="rounded-full border-destructive/40 bg-destructive/10 text-destructive gap-1 text-[0.7rem]">
        <XCircle className="size-3" />
        Declined
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="rounded-full text-muted-foreground gap-1 text-[0.7rem]">
      <ShieldAlert className="size-3" />
      Revoked
    </Badge>
  );
}

function formatPermission(perm: CaregiverPermission): string {
  switch (perm) {
    case "VIEW_MEMORIES":
      return "View Memories";
    case "ADD_MEMORIES":
      return "Add Memories";
    case "EDIT_MEMORIES":
      return "Edit Memories";
    case "DELETE_MEMORIES":
      return "Delete Memories";
    case "MANAGE_PEOPLE":
      return "Manage People";
    case "VIEW_ACTIVITY":
      return "View Activity";
    default:
      return perm;
  }
}

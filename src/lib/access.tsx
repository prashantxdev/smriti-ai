import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type CaregiverPermission = Database["public"]["Enums"]["caregiver_permission"];

export type AccessArea = "caregivers" | "settings";

export type AccessInfo = {
  userId: string | null;
  roles: AppRole[];
  /** Accepted caregiver links where the signed-in user is the caregiver. */
  grantedPermissions: CaregiverPermission[];
  hasAcceptedLink: boolean;
  isOwnerAccount: boolean;
  can: (area: AccessArea) => boolean;
};

/**
 * Loads the signed-in user's roles plus the caregiver permissions assigned to them,
 * and derives which restricted areas they may open.
 */
export function useAccess() {
  return useQuery<AccessInfo>({
    queryKey: ["access", "me"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (!userId) return buildAccess(null, [], []);

      const [rolesRes, linksRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase
          .from("caregivers")
          .select("id, status, caregiver_permissions(permission, enabled)")
          .eq("caregiver_id", userId)
          .eq("status", "accepted"),
      ]);

      const roles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
      const permissions = (linksRes.data ?? []).flatMap((link) =>
        (link.caregiver_permissions ?? [])
          .filter((p: { enabled: boolean }) => p.enabled)
          .map((p: { permission: CaregiverPermission }) => p.permission),
      );
      return buildAccess(userId, roles, permissions, (linksRes.data ?? []).length > 0);
    },
  });
}

function buildAccess(
  userId: string | null,
  roles: AppRole[],
  grantedPermissions: CaregiverPermission[],
  hasAcceptedLink = false,
): AccessInfo {
  const isAdmin = roles.includes("admin");
  // Someone who holds a personal account (role "user") owns their own memory library.
  const isOwnerAccount = roles.includes("user") || isAdmin;

  function can(area: AccessArea) {
    if (!userId) return false;
    if (isAdmin || isOwnerAccount) return true;
    if (area === "caregivers") return hasAcceptedLink;
    if (area === "settings") return grantedPermissions.includes("VIEW_ACTIVITY");
    return false;
  }

  return { userId, roles, grantedPermissions, hasAcceptedLink, isOwnerAccount, can };
}

export function RequireAccess({ area, children }: { area: AccessArea; children: ReactNode }) {
  const access = useAccess();

  if (access.isPending) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!access.data?.can(area)) {
    return (
      <div className="surface-card mt-8 flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">You don&apos;t have access here</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            This area is limited to account owners and caregivers who have been given permission. Ask the person you
            care for to invite you or update your permissions.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to Today</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

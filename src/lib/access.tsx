import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type CaregiverPermission = Database["public"]["Enums"]["caregiver_permission"];

export type AccessArea =
  | "caregivers"
  | "settings"
  | "memories"
  | "people"
  | "places"
  | "objects"
  | "companion"
  | "recognise"
  | "activity";

export type AccessInfo = {
  userId: string | null;
  userEmail: string | null;
  roles: AppRole[];
  /** Caregiver links where signed-in user is caregiver */
  grantedPermissions: CaregiverPermission[];
  hasAcceptedLink: boolean;
  isOwnerAccount: boolean;
  can: (area: AccessArea) => boolean;
  canPermission: (permission: CaregiverPermission) => boolean;
};

/**
 * Loads the signed-in user's roles plus the caregiver permissions assigned to them,
 * and derives which restricted areas & actions they may open.
 */
export function useAccess() {
  return useQuery<AccessInfo>({
    queryKey: ["access", "me"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      const userEmail = userData.user?.email ?? null;
      if (!userId) return buildAccess(null, null, [], []);

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
      return buildAccess(userId, userEmail, roles, permissions, (linksRes.data ?? []).length > 0);
    },
  });
}

function buildAccess(
  userId: string | null,
  userEmail: string | null,
  roles: AppRole[],
  grantedPermissions: CaregiverPermission[],
  hasAcceptedLink = false,
): AccessInfo {
  const isAdmin = roles.includes("admin");
  // Owner accounts hold role 'user' or 'admin'
  const isOwnerAccount = roles.includes("user") || isAdmin || roles.length === 0;

  function can(area: AccessArea) {
    if (!userId) return false;
    if (isAdmin || isOwnerAccount) return true;
    if (area === "caregivers") return true;
    if (area === "settings") return true;
    if (area === "memories") return grantedPermissions.includes("VIEW_MEMORIES");
    if (area === "people") return grantedPermissions.includes("VIEW_MEMORIES") || grantedPermissions.includes("MANAGE_PEOPLE");
    if (area === "places" || area === "objects") return grantedPermissions.includes("VIEW_MEMORIES");
    if (area === "companion" || area === "recognise") return grantedPermissions.includes("VIEW_MEMORIES");
    if (area === "activity") return grantedPermissions.includes("VIEW_ACTIVITY");
    return false;
  }

  function canPermission(permission: CaregiverPermission) {
    if (!userId) return false;
    if (isAdmin || isOwnerAccount) return true;
    return grantedPermissions.includes(permission);
  }

  return {
    userId,
    userEmail,
    roles,
    grantedPermissions,
    hasAcceptedLink,
    isOwnerAccount,
    can,
    canPermission,
  };
}

export function RequireAccess({
  area,
  permission,
  children,
}: {
  area?: AccessArea;
  permission?: CaregiverPermission;
  children: ReactNode;
}) {
  const access = useAccess();

  if (access.isPending) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const allowedArea = area ? access.data?.can(area) : true;
  const allowedPermission = permission ? access.data?.canPermission(permission) : true;

  if (!allowedArea || !allowedPermission) {
    return (
      <div className="surface-card mt-8 flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">You don&apos;t have access here</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            This area or action is limited. Ask the account owner to update your caregiver permissions.
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

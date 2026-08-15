import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Calendar,
  History,
  Shield,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/lib/access";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ActivityLogItem = {
  id: string;
  actor_id: string;
  patient_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
};

export function ActivityLogs() {
  const access = useAccess();
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const logsQuery = useQuery<ActivityLogItem[]>({
    queryKey: ["activity-logs"],
    staleTime: 15_000,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as ActivityLogItem[];
    },
    enabled: access.data?.canPermission("VIEW_ACTIVITY") ?? false,
  });

  if (!access.data?.canPermission("VIEW_ACTIVITY")) {
    return (
      <div className="surface-card flex flex-col items-center justify-center p-10 text-center">
        <Shield className="size-10 text-muted-foreground" />
        <h3 className="mt-3 font-display text-lg font-semibold">Access Restricted</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You need the VIEW_ACTIVITY permission to view audit activity logs.
        </p>
      </div>
    );
  }

  const logs = (logsQuery.data ?? []).filter((log) => {
    if (filterAction !== "all" && !log.action.includes(filterAction)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const actionText = formatActionName(log.action).toLowerCase();
      const metadataText = JSON.stringify(log.metadata).toLowerCase();
      return actionText.includes(q) || metadataText.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <History className="size-5 text-primary" />
            Audit Activity Logs
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent record of all caregiver and memory updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-40 sm:w-52 rounded-xl text-xs"
          />
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="h-9 w-36 rounded-xl text-xs">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="caregiver">Caregiver Actions</SelectItem>
              <SelectItem value="permission">Permissions</SelectItem>
              <SelectItem value="memory">Memories</SelectItem>
              <SelectItem value="person">People</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {logsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : logs.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
          <Activity className="size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium text-foreground">No activity logs recorded yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Actions like inviting caregivers, adding memories, or updating permissions will appear here.
          </p>
        </div>
      ) : (
        <div className="relative space-y-3 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
          {logs.map((log) => {
            const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
            const isMe = log.actor_id === access.data?.userId;
            const actorLabel = isMe
              ? "You"
              : (log.metadata as Record<string, any>)?.['caregiver_name'] || (log.metadata as Record<string, any>)?.['caregiver_email'] || "Caregiver";

            return (
              <div
                key={log.id}
                className="surface-card relative flex items-start gap-4 p-4 pl-12 transition-shadow hover:shadow-soft"
              >
                {/* Timeline dot */}
                <span className="absolute left-4 top-4 flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary border border-background">
                  <span className="size-2 rounded-full bg-primary" />
                </span>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        {actorLabel}
                      </span>
                      <ActionBadge action={log.action} />
                    </div>

                    <span className="text-[0.7rem] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formatLogDetails(log)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  let color = "bg-primary/10 text-primary";
  if (action.includes("created") || action.includes("invited") || action.includes("accepted")) {
    color = "bg-teal/15 text-teal";
  } else if (action.includes("deleted") || action.includes("revoked")) {
    color = "bg-destructive/10 text-destructive";
  } else if (action.includes("permission") || action.includes("updated")) {
    color = "bg-purple-500/15 text-purple-600 dark:text-purple-400";
  }

  return (
    <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[0.65rem] font-medium border-0 ${color}`}>
      {formatActionName(action)}
    </Badge>
  );
}

function formatActionName(action: string): string {
  switch (action) {
    case "caregiver_invited":
      return "Caregiver Invited";
    case "caregiver_accepted":
      return "Invitation Accepted";
    case "caregiver_revoked":
      return "Caregiver Revoked";
    case "permission_updated":
      return "Permissions Updated";
    case "memory_created":
      return "Added Memory";
    case "memory_updated":
      return "Updated Memory";
    case "memory_deleted":
      return "Deleted Memory";
    case "person_created":
      return "Added Person";
    case "person_updated":
      return "Updated Person";
    case "person_deleted":
      return "Deleted Person";
    default:
      return action.replace(/_/g, " ");
  }
}

function formatLogDetails(log: ActivityLogItem): string {
  const meta = (log.metadata as Record<string, any>) || {};
  if (log.action === "caregiver_invited") {
    return `Sent invitation to caregiver ${meta['caregiver_email'] || ""}`;
  }
  if (log.action === "caregiver_accepted") {
    return `Accepted caregiver invitation for patient`;
  }
  if (log.action === "caregiver_revoked") {
    return `Revoked access for caregiver ${meta['caregiver_email'] || ""}`;
  }
  if (log.action === "permission_updated") {
    return `Updated permissions for ${meta['caregiver_email'] || "caregiver"}`;
  }
  if (log.action.includes("memory")) {
    return `${meta['title'] ? `"${meta['title']}"` : "Memory record"}`;
  }
  if (log.action.includes("person")) {
    return `${meta['name'] ? `"${meta['name']}"` : "Person profile"}`;
  }
  return JSON.stringify(meta);
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  Clock,
  Heart,
  Info,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Smriti AI" },
      {
        name: "description",
        content: "Stay updated on caregiver invites, memory additions, and system notifications.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

type NotificationCategory = "all" | "caregiver" | "memory" | "system";

type NotificationItem = {
  id: string;
  category: "caregiver" | "memory" | "system";
  title: string;
  description: string;
  created_at: string;
  read: boolean;
  action_url?: string;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    category: "caregiver",
    title: "Caregiver Invitation Accepted",
    description: "Anita Sharma accepted your caregiver invitation and can now assist with your memory library.",
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    read: false,
  },
  {
    id: "n-2",
    category: "memory",
    title: "Important Memory Reminder",
    description: 'Rahul\'s birthday memory "Family Celebration at Raj Palace" was added 1 year ago today.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: false,
  },
  {
    id: "n-3",
    category: "caregiver",
    title: "Permissions Updated",
    description: "Permissions for Anita Sharma were updated: View Memories (✓), Edit Memories (✓), Delete (✗).",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "n-4",
    category: "system",
    title: "Welcome to Smriti AI",
    description: "Your memory library is ready! Start by adding familiar faces or taking a photo with Visual Recognition.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
];

function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.category === activeTab;
  });

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Marked notification as read");
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  }

  function clearAll() {
    setNotifications([]);
    toast.success("Cleared notifications");
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Caregiver updates, memory milestones, and security access alerts."
        action={
          notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="rounded-full text-xs gap-1.5"
                >
                  <CheckCheck className="size-3.5 text-teal" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="rounded-full text-xs gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>
          )
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotificationCategory)} className="mt-8">
        <TabsList className="rounded-xl bg-card border border-border p-1">
          <TabsTrigger value="all" className="rounded-lg gap-2">
            <Bell className="size-4" />
            All ({notifications.length})
            {unreadCount > 0 && (
              <span className="size-2 rounded-full bg-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger value="caregiver" className="rounded-lg gap-2">
            <Shield className="size-4" />
            Caregivers
          </TabsTrigger>
          <TabsTrigger value="memory" className="rounded-lg gap-2">
            <Sparkles className="size-4" />
            Memories
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg gap-2">
            <Info className="size-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bell className="size-7" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">No notifications</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                You're all caught up! Caregiver updates and memory reminders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
                return (
                  <div
                    key={item.id}
                    className={`surface-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 transition-all ${
                      !item.read ? "border-l-4 border-l-primary bg-primary/5" : "opacity-90"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border">
                        {item.category === "caregiver" ? (
                          <UserCheck className="size-5 text-teal" />
                        ) : item.category === "memory" ? (
                          <Heart className="size-5 text-primary" />
                        ) : (
                          <Info className="size-5 text-purple-500" />
                        )}
                      </span>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-base font-semibold text-foreground">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <Badge className="rounded-full bg-primary text-primary-foreground text-[0.65rem] px-2 py-0">
                              New
                            </Badge>
                          )}
                          <span className="text-[0.7rem] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {timeAgo}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {!item.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(item.id)}
                        className="self-end sm:self-center rounded-xl text-xs gap-1.5 shrink-0"
                      >
                        <CheckCheck className="size-3.5 text-primary" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

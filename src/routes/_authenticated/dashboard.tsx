import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Camera, Images, MessageCircleHeart, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { OnboardingModal } from "@/components/app/OnboardingModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Today — Smriti AI" },
      { name: "description", content: "Your memory companion dashboard: people, memories and quick actions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const QUICK_ACTIONS = [
  { to: "/recognise", label: "Recognise someone", icon: Camera, copy: "Point the camera and get a name." },
  { to: "/companion", label: "Ask Smriti", icon: MessageCircleHeart, copy: "Ask about a person or a day." },
  { to: "/memories", label: "Add a memory", icon: Images, copy: "Save a moment while it's fresh." },
  { to: "/people", label: "Add a person", icon: Users, copy: "Grow your circle of familiar faces." },
] as const;

function Dashboard() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("smriti_onboarding_done");
    if (!done) {
      setOnboardingOpen(true);
    }
  }, []);

  function handleCompleteOnboarding() {
    localStorage.setItem("smriti_onboarding_done", "true");
    setOnboardingOpen(false);
  }

  const counts = useQuery({
    queryKey: ["dashboard", "counts"],
    queryFn: async () => {
      const [people, memories, places, objects] = await Promise.all([
        supabase.from("people").select("*", { count: "exact", head: true }),
        supabase.from("memories").select("*", { count: "exact", head: true }),
        supabase.from("places").select("*", { count: "exact", head: true }),
        supabase.from("objects").select("*", { count: "exact", head: true }),
      ]);
      return {
        people: people.count ?? 0,
        memories: memories.count ?? 0,
        places: places.count ?? 0,
        objects: objects.count ?? 0,
      };
    },
  });

  const recentMemories = useQuery({
    queryKey: ["dashboard", "recent-memories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const recentActivity = useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = [
    { label: "People", value: counts.data?.people, to: "/people" },
    { label: "Memories", value: counts.data?.memories, to: "/memories" },
    { label: "Places", value: counts.data?.places, to: "/places" },
    { label: "Objects", value: counts.data?.objects, to: "/objects" },
  ];

  return (
    <div>
      <PageHeader
        title="Today"
        description="A calm summary of your memory library, and the quickest ways to add to it."
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOnboardingOpen(true)}
            className="rounded-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            Quick Tour
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="surface-card p-5 transition-shadow hover:shadow-lift">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {stat.label}
            </p>
            {counts.isPending ? (
              <Skeleton className="mt-3 h-8 w-12" />
            ) : (
              <p className="mt-2 font-display text-3xl font-semibold text-foreground">{stat.value ?? 0}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mt-12 font-display text-xl font-semibold text-foreground">Quick actions</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="surface-card flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <action.icon className="size-5" />
            </span>
            <span>
              <span className="block font-display text-base font-semibold text-foreground">
                {action.label}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{action.copy}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Memories Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent Memories</h2>
          <Link to="/memories" className="text-xs font-semibold text-primary hover:underline">
            View all memories →
          </Link>
        </div>

        {recentMemories.isPending ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        ) : (recentMemories.data ?? []).length === 0 ? (
          <div className="surface-card mt-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">No recent memories added yet.</p>
            <Button asChild size="sm" className="mt-3 rounded-full text-xs">
              <Link to="/memories">Add your first memory</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {recentMemories.data?.map((mem) => (
              <Link
                key={mem.id}
                to="/memories"
                className="surface-card flex flex-col justify-between p-4 transition-all hover:shadow-soft"
              >
                <div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary">
                    {mem.memory_type}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold line-clamp-1">{mem.title}</h3>
                  {mem.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{mem.description}</p>
                  )}
                </div>
                <div className="mt-3 text-[0.7rem] text-muted-foreground">
                  {mem.event_date ? new Date(mem.event_date).toLocaleDateString() : "Saved recently"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline Summary */}
      {(recentActivity.data ?? []).length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Recent Activity</h2>
            <Link to="/settings" className="text-xs font-semibold text-primary hover:underline">
              Full audit log →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentActivity.data?.map((log) => (
              <div key={log.id} className="surface-card flex items-center justify-between p-3.5 text-xs">
                <span className="font-medium text-foreground">
                  {log.action.replace(/_/g, " ").toUpperCase()}
                </span>
                <span className="text-muted-foreground">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caregiver Banner */}
      <div className="surface-card mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Invite someone you trust</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Caregivers only see what you allow, and you can revoke access at any time.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/caregivers">Manage caregivers</Link>
        </Button>
      </div>

      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}

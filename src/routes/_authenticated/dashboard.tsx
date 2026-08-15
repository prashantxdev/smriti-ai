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

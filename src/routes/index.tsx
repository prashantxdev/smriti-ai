import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  Camera,
  HeartHandshake,
  Lock,
  MessageCircleHeart,
  ScanFace,
  Search,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smriti AI — AI That Remembers What Matters." },
      {
        name: "description",
        content:
          "An intelligent memory companion that helps you recognise people, understand your surroundings and stay connected to what matters.",
      },
      { property: "og:title", content: "Smriti AI — AI That Remembers What Matters." },
      {
        property: "og:description",
        content:
          "Recognise familiar faces, keep memories safe and let trusted caregivers help — with a calm, accessible AI companion.",
      },
    ],
  }),
  component: Landing,
});

const LOOP = [
  { icon: Camera, title: "See", copy: "Point the camera at a person, object or room." },
  {
    icon: Brain,
    title: "Understand",
    copy: "Smriti reads the scene and matches it to your world.",
  },
  { icon: Sparkles, title: "Remember", copy: "Every moment becomes a searchable memory." },
  { icon: MessageCircleHeart, title: "Connect", copy: "Ask a question, get a warm, plain answer." },
];

const FEATURES = [
  {
    icon: ScanFace,
    title: "Familiar faces, named gently",
    copy: "Recognise the people you love, with relationship, last visit and a memory to talk about.",
  },
  {
    icon: Search,
    title: "Search the way you remember",
    copy: '"family dinner", "last Sunday", "hospital" — semantic search finds the moment, not just the word.',
  },
  {
    icon: Users,
    title: "Caregivers, with real boundaries",
    copy: "Invite someone you trust and grant exactly the permissions you choose. Revoke them any time.",
  },
  {
    icon: Volume2,
    title: "Speak and be answered",
    copy: "Talk to Smriti and hear the reply out loud. No typing needed.",
  },
  {
    icon: Lock,
    title: "Your memories belong to you",
    copy: "Private by default, protected per account, exportable and deletable whenever you want.",
  },
  {
    icon: HeartHandshake,
    title: "Built for accessibility",
    copy: "Large text, high contrast, big touch targets and simple language throughout.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Multimodal memory companion
              </span>

              <h1 className="mt-6 font-display text-5xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-6xl">
                SMRITI <span className="brand-gradient-text">AI</span>
              </h1>
              <p className="mt-4 font-display text-2xl font-medium text-foreground/85 sm:text-3xl">
                AI That Remembers What Matters.
              </p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                An intelligent memory companion that helps you recognise people, understand your
                surroundings, and stay connected to the moments and information that matter.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-13 rounded-full px-8 text-base">
                  <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                    Get Started
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full px-8 text-base"
                >
                  <a href="#how-it-works">Explore Smriti AI</a>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Free to explore · Works on phone, tablet and desktop
              </p>
            </div>

            <RecognitionVisual />
          </div>
        </section>

        {/* Loop */}
        <section id="how-it-works" className="border-y border-border bg-card/50">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-3xl font-semibold text-foreground">
              See → Understand → Remember → Connect
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              One calm loop that turns everyday moments into a memory you can come back to.
            </p>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {LOOP.map((step, i) => (
                <li key={step.title} className="surface-card p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <step.icon className="size-5" />
                  </span>
                  <p className="mt-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Everything a memory companion should do
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Vision, memory and conversation working together — designed to feel human, never
            clinical.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="surface-card p-7 transition-shadow hover:shadow-lift"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Caregiver band */}
        <section className="border-y border-border bg-card/50">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Families care together
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                A caregiver can add the people who visit, keep important information current and see
                how the day went — but only with the permissions the person themselves granted.
                Trust is a setting, not an assumption.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {[
                  "Invite a family member by email",
                  "Choose exactly what they can view or change",
                  "Revoke access instantly at any time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-card p-8">
              <Logo size={52} tagline />
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                “That's Rahul, your son. You last saw him at the family dinner four days ago.”
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                An example of how Smriti answers — short, warm, and grounded in your own memories.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Start remembering what matters
          </h2>
          <p className="mt-4 text-muted-foreground">
            Set up your memory library in a few minutes. Add the people you love, and let Smriti
            hold the details for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-13 rounded-full px-8 text-base">
              <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                Get Started
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-13 rounded-full px-8 text-base">
              <Link to="/about">Learn more</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function RecognitionVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="surface-card relative overflow-hidden p-6 shadow-lift">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="pulse-ring absolute inline-flex size-full rounded-full bg-teal" />
              <span className="relative inline-flex size-2 rounded-full bg-teal" />
            </span>
            Camera active
          </span>
          <span>Recognising…</span>
        </div>

        <div className="relative mt-5 aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-navy via-primary to-purple">
          <div className="absolute inset-0 aurora opacity-60" aria-hidden />
          {/* face frame */}
          <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-background/70">
            <span className="absolute -top-6 left-0 rounded-md bg-background/90 px-2 py-1 text-[0.65rem] font-semibold text-foreground">
              Face detected
            </span>
          </div>
          <div className="scan-line absolute inset-x-6 top-0 h-16 bg-linear-to-b from-transparent via-background/40 to-transparent" />
        </div>

        <div className="mt-5 space-y-3">
          <div className="float-soft rounded-2xl border border-border bg-background/80 p-4">
            <p className="font-display text-lg font-semibold text-foreground">Rahul</p>
            <p className="text-sm text-muted-foreground">Son · 96% confident</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Last memory
            </p>
            <p className="mt-1 text-sm text-foreground">Family dinner, four days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Smriti AI — a memory companion built with care" },
      {
        name: "description",
        content:
          "Why Smriti AI exists: an accessible, private memory companion for people with memory difficulties and the families who support them.",
      },
      { property: "og:title", content: "About Smriti AI" },
      {
        property: "og:description",
        content: "A calm, private memory companion for people with memory difficulties and their caregivers.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Logo size={56} tagline />
        <h1 className="mt-8 font-display text-4xl font-semibold text-foreground">
          Memory is more than data. It is connection.
        </h1>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            Smriti — from the Sanskrit word for memory — began with a simple observation: when memory becomes
            unreliable, the hardest losses are not facts, they are people. A face that feels familiar but has
            no name. A room that should feel like home. A story you know you lived but cannot reach.
          </p>
          <p>
            Smriti AI is a memory companion, not a medical device. It watches with you, not over you. Point
            the camera at a person and it offers a name, a relationship and a shared moment. Ask a question in
            your own words and it answers in plain language, grounded in the memories you and your family
            chose to keep.
          </p>
          <p>
            Everything is built around four beliefs: memories belong to the person who lived them, caregivers
            should have exactly the access they were given and no more, technology for memory must be
            unhurried and readable, and an assistant should sound like a person who knows you.
          </p>
        </div>

        <h2 className="mt-12 font-display text-2xl font-semibold text-foreground">How Smriti works</h2>
        <ol className="mt-6 space-y-4">
          {[
            ["See", "Camera or photo input captures the moment."],
            ["Understand", "Vision models describe faces, objects and scenes."],
            ["Remember", "Each moment is stored as a memory with people, places and importance."],
            ["Retrieve", "Semantic search finds the right memory, even from a vague question."],
            ["Connect", "The assistant answers warmly, using your context."],
          ].map(([title, copy]) => (
            <li key={title} className="surface-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
            </li>
          ))}
        </ol>

        <div className="surface-card mt-12 p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">An important note</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Smriti AI is an assistive technology designed to support memory and everyday interactions. It is
            not a medical diagnosis or treatment system, and it is not a substitute for professional medical
            care.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
              Get Started
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/privacy">Read our privacy approach</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

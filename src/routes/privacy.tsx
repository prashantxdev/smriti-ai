import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy at Smriti AI — your memories stay yours" },
      {
        name: "description",
        content:
          "How Smriti AI handles memories, photos, faces and caregiver access — private by default, with export and deletion always available.",
      },
      { property: "og:title", content: "Privacy at Smriti AI" },
      {
        property: "og:description",
        content: "Private by default: how Smriti AI stores, shares and deletes your memory data.",
      },
    ],
  }),
  component: Privacy,
});

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: "What Smriti stores",
    body: [
      "Your account details, the people you add (name, relationship, notes and reference photos), memories you save, places and objects you register, and your conversations with the assistant.",
      "Photos and audio you capture are stored so that Smriti can recognise them later. You choose what to capture.",
    ],
  },
  {
    title: "Who can see it",
    body: [
      "By default only you. Your data is isolated per account and protected by row-level access rules on the database.",
      "A caregiver can see only what you explicitly permit. Each permission — viewing memories, adding people, receiving alerts — is granted individually and can be revoked at any moment.",
    ],
  },
  {
    title: "Face and image data",
    body: [
      "Reference photos are used only to recognise the people you have added to your own circle. They are never used to identify strangers and are not shared across accounts.",
      "Deleting a person deletes their reference photos and recognition data with them.",
    ],
  },
  {
    title: "AI processing",
    body: [
      "Text, images and audio may be sent to AI models to describe a scene, recognise an object or generate a reply. They are processed to answer your request, not to build a public profile of you.",
      "You can turn on demo mode to explore Smriti with simulated results and no AI processing at all.",
    ],
  },
  {
    title: "Your controls",
    body: [
      "Export your memories at any time, delete individual items, or delete your account and everything in it. Deletion is permanent.",
    ],
  },
  {
    title: "Not a medical service",
    body: [
      "Smriti AI is assistive technology. It does not diagnose, treat or monitor medical conditions, and it does not replace professional care.",
    ],
  },
];

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-foreground">Privacy</h1>
        <p className="mt-4 text-muted-foreground">
          Memories are deeply personal. This page explains, in plain language, what Smriti AI keeps and who
          can reach it.
        </p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-semibold text-foreground">{section.title}</h2>
              {section.body.map((p) => (
                <p key={p} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

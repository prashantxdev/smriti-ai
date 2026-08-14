import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Smriti AI" },
      {
        name: "description",
        content:
          "The terms for using Smriti AI, including acceptable use, caregiver responsibilities and the limits of an assistive memory companion.",
      },
      { property: "og:title", content: "Terms of Use — Smriti AI" },
      {
        property: "og:description",
        content: "Acceptable use, caregiver responsibilities and the limits of Smriti AI as assistive technology.",
      },
    ],
  }),
  component: Terms,
});

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: "Using Smriti AI",
    body: [
      "You may use Smriti AI to store and recall your own memories, and to support a person who has asked you to help them as a caregiver.",
      "You are responsible for the accuracy of the information you add, including the names, relationships and notes attached to the people in your circle.",
    ],
  },
  {
    title: "Consent matters",
    body: [
      "Only add photos and details of people who have agreed to be recognised, or where you have the legal authority to act on someone's behalf.",
      "Caregiver access must be granted by the account holder. Do not use caregiver features to monitor someone without their knowledge.",
    ],
  },
  {
    title: "Assistive, not medical",
    body: [
      "Smriti AI supports memory and everyday interaction. It does not diagnose, treat or monitor any medical condition and must not be relied on for medical, safety or emergency decisions.",
      "AI recognition and answers can be wrong. Always confirm important details independently.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "Do not use Smriti AI to identify strangers, to surveil people, or for any unlawful purpose. Accounts used this way may be suspended.",
    ],
  },
  {
    title: "Availability and changes",
    body: [
      "The service is provided as is, without warranty of uninterrupted availability. Features may change as Smriti AI evolves, and these terms may be updated; continued use means you accept the updated terms.",
    ],
  },
];

function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-foreground">Terms of Use</h1>
        <p className="mt-4 text-muted-foreground">
          Plain-language terms for using Smriti AI, for both the people it supports and the caregivers who
          help them.
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

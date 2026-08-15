import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/companion")({
  head: () => ({
    meta: [
      { title: "Companion — Smriti AI" },
      { name: "description", content: "Ask Smriti about a person, a place or a day, and hear the answer in plain language." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Companion,
});

function Companion() {
  return (
    <div>
      <PageHeader title="Companion" description="Ask Smriti about a person, a place or a day, and hear the answer in plain language." />
      <ComingSoon note="The conversational companion arrives with the AI service layer." />
    </div>
  );
}

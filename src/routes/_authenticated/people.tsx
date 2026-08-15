import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/people")({
  head: () => ({
    meta: [
      { title: "People — Smriti AI" },
      { name: "description", content: "The familiar faces in your circle, with relationships and shared moments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: People,
});

function People() {
  return (
    <div>
      <PageHeader title="People" description="The familiar faces in your circle, with relationships and shared moments." />
      <ComingSoon note="Adding people and reference photos arrives in the next step." />
    </div>
  );
}

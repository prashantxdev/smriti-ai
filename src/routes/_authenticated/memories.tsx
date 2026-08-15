import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/memories")({
  head: () => ({
    meta: [
      { title: "Memories — Smriti AI" },
      { name: "description", content: "Every moment you save, searchable by the way you remember it." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Memories,
});

function Memories() {
  return (
    <div>
      <PageHeader title="Memories" description="Every moment you save, searchable by the way you remember it." />
      <ComingSoon note="Memory capture and semantic search arrive in the next step." />
    </div>
  );
}

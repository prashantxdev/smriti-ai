import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/objects")({
  head: () => ({
    meta: [
      { title: "Objects — Smriti AI" },
      { name: "description", content: "Important items and where they usually live." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Objects,
});

function Objects() {
  return (
    <div>
      <PageHeader title="Objects" description="Important items and where they usually live." />
      <ComingSoon note="Object management arrives in the next step." />
    </div>
  );
}

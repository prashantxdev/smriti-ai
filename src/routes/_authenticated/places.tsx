import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/places")({
  head: () => ({
    meta: [
      { title: "Places — Smriti AI" },
      { name: "description", content: "Rooms and locations Smriti can recognise and describe back to you." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Places,
});

function Places() {
  return (
    <div>
      <PageHeader title="Places" description="Rooms and locations Smriti can recognise and describe back to you." />
      <ComingSoon note="Place management arrives in the next step." />
    </div>
  );
}

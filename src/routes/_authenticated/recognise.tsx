import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/recognise")({
  head: () => ({
    meta: [
      { title: "Recognise — Smriti AI" },
      { name: "description", content: "Point the camera at a person, object or room and let Smriti tell you what it sees." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Recognise,
});

function Recognise() {
  return (
    <div>
      <PageHeader title="Recognise" description="Point the camera at a person, object or room and let Smriti tell you what it sees." />
      <ComingSoon note="Live recognition arrives in the next step, together with the vision service." />
    </div>
  );
}

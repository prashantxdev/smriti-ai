import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smriti AI" },
      { name: "description", content: "Accessibility, appearance, voice replies and your data controls." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <div>
      <PageHeader title="Settings" description="Accessibility, appearance, voice replies and your data controls." />
      <ComingSoon note="Full preference and data controls arrive in a later step." />
    </div>
  );
}

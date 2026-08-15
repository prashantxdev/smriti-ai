import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/caregivers")({
  head: () => ({
    meta: [
      { title: "Caregivers — Smriti AI" },
      { name: "description", content: "Invite someone you trust and choose exactly what they can see or change." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Caregivers,
});

function Caregivers() {
  return (
    <div>
      <PageHeader title="Caregivers" description="Invite someone you trust and choose exactly what they can see or change." />
      <ComingSoon note="Caregiver invitations and permissions arrive in a later step." />
    </div>
  );
}

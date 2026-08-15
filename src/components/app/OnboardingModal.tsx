import { useState } from "react";
import { ArrowRight, Check, Heart, Sparkles, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OnboardingModal({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "People",
    "Places",
    "Events",
  ]);

  const TOPICS = [
    { id: "People", label: "Family & Friends", desc: "Recognise familiar faces and relationships" },
    { id: "Places", label: "Important Places", desc: "Home, doctor clinic, park, temple" },
    { id: "Events", label: "Events & Memories", desc: "Birthdays, dinners, graduations" },
    { id: "Information", label: "Important Information", desc: "Schedules, routine notes, keys" },
  ];

  function toggleTopic(id: string) {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
      onComplete();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-6 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-8" />
            </span>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Welcome to Smriti AI</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                AI That Remembers What Matters. Let&apos;s personalize your memory companion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 text-left">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                What should Smriti help you remember?
              </p>
              {TOPICS.map((t) => {
                const selected = selectedTopics.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTopic(t.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selected
                        ? "border-primary/50 bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                    {selected && (
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-teal/15 text-teal">
              <Users className="size-8" />
            </span>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Build Your Memory Circle</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Add the people who matter most so Smriti AI can gently name them when you point the camera.
              </DialogDescription>
            </DialogHeader>

            <div className="surface-card p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold">Add a person profile</p>
                  <p className="text-xs text-muted-foreground">Name, relationship & reference photo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-teal/10 text-teal font-bold">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold">Save a shared memory</p>
                  <p className="text-xs text-muted-foreground">Family dinners, birthdays, or conversations</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <UserPlus className="size-8" />
            </span>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Caregivers Care Together</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                You can invite family or trusted helpers to assist with memories. Access is private and customizable.
              </DialogDescription>
            </DialogHeader>

            <div className="surface-card p-5 text-left text-xs space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2 text-foreground font-semibold">
                <Heart className="size-4 text-teal" /> You hold complete control
              </p>
              <p>• Grant view, edit, or delete permissions individually.</p>
              <p>• Revoke access instantly at any time.</p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 flex flex-row items-center justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              onComplete();
            }}
            className="rounded-xl text-xs text-muted-foreground"
          >
            Skip Onboarding
          </Button>

          <Button onClick={handleNext} className="rounded-xl gap-2 text-sm">
            {step === 3 ? "Get Started" : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

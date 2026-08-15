import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accessibility,
  Eye,
  History,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Save,
  Shield,
  User,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RequireAccess } from "@/lib/access";
import { PageHeader } from "@/components/app/PageHeader";
import { ActivityLogs } from "@/components/app/ActivityLogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smriti AI" },
      { name: "description", content: "Accessibility, appearance, caregiver controls, and audit logs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <RequireAccess area="settings">
      <SettingsContent />
    </RequireAccess>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState("accessibility");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Accessibility toggles stored in localStorage & root document
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem("smriti_large_text") === "true";
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("smriti_high_contrast") === "true";
  });
  const [voiceAutoRead, setVoiceAutoRead] = useState(() => {
    return localStorage.getItem("smriti_voice_autoread") === "true";
  });

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        setEmail(data.user.email || "");
        setName((data.user.user_metadata as Record<string, any> | undefined)?.['full_name'] || data.user.email?.split("@")[0] || "");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  function toggleLargeText(val: boolean) {
    setLargeText(val);
    localStorage.setItem("smriti_large_text", String(val));
    if (val) {
      document.documentElement.classList.add("large-text");
    } else {
      document.documentElement.classList.remove("large-text");
    }
  }

  function toggleHighContrast(val: boolean) {
    setHighContrast(val);
    localStorage.setItem("smriti_high_contrast", String(val));
    if (val) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }

  function toggleVoiceAutoRead(val: boolean) {
    setVoiceAutoRead(val);
    localStorage.setItem("smriti_voice_autoread", String(val));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSeedDemoData() {
    setSeeding(true);
    try {
      const { error } = await supabase.rpc("seed_demo_data");
      if (error) throw error;
      toast.success("Demo data loaded with example memories, people, places, and objects!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load demo data.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings & Controls"
        description="Configure accessibility settings, profile preferences, and view transparent audit activity logs."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="rounded-xl bg-card border border-border p-1">
          <TabsTrigger value="accessibility" className="rounded-lg gap-2">
            <Accessibility className="size-4" />
            Accessibility & Visuals
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg gap-2">
            <User className="size-4" />
            Profile & Account
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-2">
            <History className="size-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="mt-6 space-y-6">
          <div className="surface-card p-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Accessibility className="size-5 text-primary" />
                Assistive Visual & Audio Controls
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Customize text size, contrast, and voice synthesis for maximum comfort.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-border/60">
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Eye className="size-4 text-primary" />
                    Large Text Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increases body font size and touch target spacing throughout the application.
                  </p>
                </div>
                <Switch checked={largeText} onCheckedChange={toggleLargeText} />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Shield className="size-4 text-primary" />
                    High Contrast Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enhances border visibility and text contrast for low vision usability.
                  </p>
                </div>
                <Switch checked={highContrast} onCheckedChange={toggleHighContrast} />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Volume2 className="size-4 text-primary" />
                    Auto-Read Companion Responses
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically reads out AI Companion replies in voice text-to-speech.
                  </p>
                </div>
                <Switch checked={voiceAutoRead} onCheckedChange={toggleVoiceAutoRead} />
              </div>
            </div>
          </div>

          <div className="surface-card p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-semibold">Load Example Memory Data</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Populate your library with sample family memories, people, places, and objects.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => void handleSeedDemoData()}
              disabled={seeding}
              className="rounded-xl gap-2"
            >
              {seeding ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Load Example Data
            </Button>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <form onSubmit={handleSaveProfile} className="surface-card p-6 space-y-4 max-w-lg">
            <h3 className="font-display text-lg font-semibold">Account Profile</h3>

            <div className="space-y-1.5">
              <Label htmlFor="s-email" className="text-xs font-semibold uppercase text-muted-foreground">
                Email Address
              </Label>
              <Input id="s-email" disabled value={email} className="h-11 rounded-xl bg-muted" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-name" className="text-xs font-semibold uppercase text-muted-foreground">
                Display Name
              </Label>
              <Input
                id="s-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <Button type="submit" disabled={busy} className="rounded-xl gap-2 mt-4">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Profile
            </Button>
          </form>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity" className="mt-6">
          <ActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}

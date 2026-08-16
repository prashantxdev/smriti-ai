import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  Loader2,
  LogOut,
  Mail,
  Save,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/lib/access";
import { PageHeader } from "@/components/app/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Smriti AI" },
      { name: "description", content: "Your Smriti AI account profile and personal preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const access = useAccess();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        setEmail(data.user.email || "");
        const metaName = (data.user.user_metadata as Record<string, any> | undefined)?.["full_name"];
        setName(metaName || data.user.email?.split("@")[0] || "");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  const initials = (name || email || "?").slice(0, 2).toUpperCase();

  return (
    <div>
      <PageHeader
        title="Profile & Account"
        description="Manage your account profile, display name, and access credentials."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Profile Form */}
        <div className="surface-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <Avatar className="size-20 border-2 border-primary/30 shadow-soft">
              <AvatarFallback className="bg-primary/10 font-display text-2xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">{name || "User Profile"}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="size-3.5" />
                {email || "Signed in"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full text-[0.65rem] font-medium">
                  {access.data?.isOwnerAccount ? "Account Owner" : "Caregiver Account"}
                </Badge>
                <Badge className="rounded-full bg-teal/15 text-teal border-0 text-[0.65rem]">
                  <CheckCircle2 className="size-3 mr-1 inline" />
                  Active Session
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="p-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <Input id="p-email" disabled value={email} className="h-11 rounded-xl bg-muted" />
              <p className="text-[0.7rem] text-muted-foreground">Email address is managed via your Supabase authentication account.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Display Name
              </Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anjali Sharma"
                className="h-11 rounded-xl"
              />
            </div>

            <Button type="submit" disabled={busy} className="rounded-xl gap-2 h-11 px-6">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Profile
            </Button>
          </form>
        </div>

        {/* Quick Links Sidebar Card */}
        <div className="space-y-4">
          <div className="surface-card p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Quick Account Links</h3>

            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start rounded-xl gap-3">
                <Link to="/settings">
                  <Settings className="size-4 text-primary" />
                  Settings & Accessibility
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start rounded-xl gap-3">
                <Link to="/caregivers">
                  <ShieldCheck className="size-4 text-teal" />
                  Caregiver Permissions
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start rounded-xl gap-3">
                <Link to="/notifications">
                  <Bell className="size-4 text-purple-500" />
                  Notifications
                </Link>
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <Button
                variant="destructive"
                onClick={() => void handleSignOut()}
                className="w-full justify-start rounded-xl gap-3 text-xs"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

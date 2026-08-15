import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Camera,
  Home,
  Images,
  LogOut,
  MapPin,
  Menu,
  MessageCircleHeart,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAccess } from "@/lib/access";

export const APP_NAV = [
  { to: "/dashboard", label: "Today", icon: Home },
  { to: "/recognise", label: "Recognise", icon: Camera },
  { to: "/companion", label: "Companion", icon: MessageCircleHeart },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/people", label: "People", icon: Users },
  { to: "/places", label: "Places", icon: MapPin },
  { to: "/objects", label: "Objects", icon: Package },
  { to: "/caregivers", label: "Caregivers", icon: Bell, area: "caregivers" },
  { to: "/settings", label: "Settings", icon: Settings, area: "settings" },
] as const;

const PRIMARY_MOBILE_NAV = APP_NAV.slice(0, 4);

function useVisibleNav() {
  const access = useAccess();
  return APP_NAV.filter((item) => {
    if (!("area" in item)) return true;
    return access.data?.can(item.area) ?? false;
  });
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navItems = useVisibleNav();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/60 px-4 py-6 lg:flex">
        <Link to="/dashboard" aria-label="Smriti AI dashboard" className="px-2">
          <Logo size={36} />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Application">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="size-[1.15rem]" />
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="px-3 text-xs leading-relaxed text-muted-foreground">
          Smriti AI is assistive technology, not medical care.
        </p>
      </aside>

      <div className="lg:pl-64">
        <AppHeader onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
          {PRIMARY_MOBILE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-primary" }}
              className="flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.7rem] font-medium text-muted-foreground"
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
          <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
        </div>
      </nav>
    </div>
  );
}

function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navItems = useVisibleNav();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.7rem] font-medium text-muted-foreground"
        >
          <Menu className="size-5" />
          More
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-2 gap-2 pb-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => onOpenChange(false)}
              activeProps={{ className: "border-primary/40 bg-primary/10 text-primary" }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const access = useAccess();

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  const initials = (email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Open menu" onClick={onOpenMenu}>
            <Menu className="size-5" />
          </Button>
          <Link to="/dashboard" aria-label="Smriti AI dashboard">
            <Logo size={32} withWordmark={false} />
          </Link>
        </div>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                {email ?? "Signed in"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {access.data?.can("settings") ? (
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => void handleSignOut()}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

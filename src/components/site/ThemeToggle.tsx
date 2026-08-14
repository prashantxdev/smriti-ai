import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/lib/preferences";

export function ThemeToggle() {
  const { prefs, toggleTheme } = usePreferences();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={prefs.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {prefs.theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

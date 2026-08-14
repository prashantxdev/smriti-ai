import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Preferences = {
  theme: "light" | "dark";
  largeText: boolean;
  highContrast: boolean;
  /** When true the app uses built-in simulated AI instead of live models. */
  demoAi: boolean;
  voiceReplies: boolean;
};

const DEFAULTS: Preferences = {
  theme: "light",
  largeText: false,
  highContrast: false,
  demoAi: false,
  voiceReplies: false,
};

const STORAGE_KEY = "smriti.preferences";

type PreferencesContextValue = {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggleTheme: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function applyToDocument(prefs: Preferences) {
  const root = document.documentElement;
  root.classList.toggle("dark", prefs.theme === "dark");
  root.classList.toggle("text-large", prefs.largeText);
  root.classList.toggle("high-contrast", prefs.highContrast);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? ({ ...DEFAULTS, ...JSON.parse(raw) } as Preferences) : DEFAULTS;
      setPrefs(stored);
      applyToDocument(stored);
    } catch {
      applyToDocument(DEFAULTS);
    }
  }, []);

  const setPref = useCallback<PreferencesContextValue["setPref"]>((key, value) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — preferences stay for this session only */
      }
      applyToDocument(next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((current) => {
      const next = { ...current, theme: current.theme === "dark" ? ("light" as const) : ("dark" as const) };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      applyToDocument(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ prefs, setPref, toggleTheme }), [prefs, setPref, toggleTheme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}

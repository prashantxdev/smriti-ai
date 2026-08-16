import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const smritiAuth = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft", opts?: SignInOptions) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === "google" ? "google" : provider,
        options: {
          redirectTo: opts?.redirect_uri || window.location.origin,
        },
      });
      return { data, error };
    },
  },
};


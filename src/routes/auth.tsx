import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { smritiAuth } from "@/integrations/smriti/index";
import { Logo } from "@/components/brand/Logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

type AuthSearch = { mode?: Mode; redirect?: string | undefined };

function sanitizeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
    redirect: sanitizeRedirect(search["redirect"]),
  }),
  head: () => ({
    meta: [
      { title: "Sign in to Smriti AI" },
      {
        name: "description",
        content:
          "Sign in or create your Smriti AI account to start building a memory library that remembers what matters.",
      },
      { property: "og:title", content: "Sign in to Smriti AI" },
      {
        property: "og:description",
        content: "Create your Smriti AI account and start your memory library.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const destination = redirect ?? "/dashboard";
  const isSignup = mode === "signup";

  // Handle email confirmation callback from Supabase
  useEffect(() => {
    let active = true;

    async function handleEmailConfirmation() {
      // Get the hash fragment from the URL (contains code and type)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const code = hashParams.get("code");
      const type = hashParams.get("type");

      if (!code || !type) {
        return;
      }

      setVerifying(true);
      setVerificationError(null);

      try {
        // Verify the OTP code from the email link
        const { error } = email
          ? await supabase.auth.verifyOtp({
            type: type as "email" | "signup" | "magiclink" | "recovery",
            token: code,
            email,
          })
          : await supabase.auth.verifyOtp({
            type: type as "email" | "signup" | "magiclink" | "recovery",
            token_hash: code,
          });

        if (error) {
          if (active) {
            setVerificationError(error.message || "Failed to verify email. Please try again.");
            toast.error(error.message || "Email verification failed");
          }
        } else {
          if (active) {
            setVerificationSuccess(true);
            toast.success("Email verified! You can now sign in.");
            // Give user a moment to see the success message
            setTimeout(() => {
              void navigate({ to: destination, replace: true });
            }, 1500);
          }
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : "An unexpected error occurred";
          setVerificationError(message);
          toast.error(message);
        }
      } finally {
        if (active) {
          setVerifying(false);
        }
      }
    }

    void handleEmailConfirmation();
    return () => {
      active = false;
    };
  }, [navigate, destination]);

  // Check if user is already signed in
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session && !verifying) void navigate({ to: destination, replace: true });
    });
    return () => {
      active = false;
    };
  }, [destination, navigate, verifying]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setVerificationError(null);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Redirect back to /auth so we can handle the email confirmation callback
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await navigate({ to: destination, replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setVerificationError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await smritiAuth.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in didn't work. Please try again.");
        return;
      }
      if (result.redirected) return;
      await navigate({ to: destination, replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Link to="/">
            <Logo size={48} tagline />
          </Link>
        </div>

        <div className="surface-card mt-8 p-7 shadow-lift">
          {verifying ? (
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Verifying your email...
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Please wait while we confirm your email address.
              </p>
              <div className="mt-6 flex justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            </div>
          ) : verificationSuccess ? (
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Email verified!
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your account is ready. Redirecting you now...
              </p>
              <div className="mt-6 flex justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            </div>
          ) : verificationError ? (
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Verification failed
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {verificationError}
              </p>
              <Button asChild variant="default" className="mt-6 rounded-full">
                <Link to="/auth" search={{ mode: "signin" }}>Try signing in</Link>
              </Button>
            </div>
          ) : emailSent ? (
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Check your email
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{email}</span>. Open it to finish
                creating your Smriti AI account.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                💡 Tip: Check your spam or promotions folder if you don't see the email.
              </p>
              <Button asChild variant="ghost" className="mt-6 rounded-full">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSignup
                  ? "A few details, and your memory library is ready."
                  : "Sign in to continue where you left off."}
              </p>

              {verificationError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                disabled={busy}
                className="mt-6 h-12 w-full rounded-xl text-base"
              >
                <GoogleMark />
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs tracking-wide text-muted-foreground uppercase">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Your name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      required
                      className="h-12"
                      placeholder="Anjali Sharma"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="h-12"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    required
                    minLength={8}
                    className="h-12"
                    placeholder={isSignup ? "At least 8 characters" : "••••••••"}
                  />
                </div>

                <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-base">
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {isSignup ? "Create account" : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "New to Smriti AI?"}{" "}
                <Link
                  to="/auth"
                  search={{ mode: isSignup ? "signin" : "signup", redirect }}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {isSignup ? "Sign in" : "Create one"}
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline underline-offset-4">
            Privacy approach
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

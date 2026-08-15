import { useState } from "react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  tagline?: boolean;
};

/**
 * Smriti AI brand lockup.
 * Renders the circular emblem smoothly scaled so it fits completely and cleanly inside the round icon box.
 */
export function Logo({ className, size = 36, withWordmark = true, tagline = false }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  // Using local logo from public folder for better performance and reliability
  const logoSrc = "/smriti-logo.png";

  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Left Circular Emblem - Scaled to fit completely without any cropping */}
      <span
        className="relative shrink-0 flex items-center justify-center overflow-hidden rounded-full bg-slate-900/5 dark:bg-white/5 ring-1 ring-border/40 p-0.5"
        style={{ width: size, height: size }}
      >
        {!imgError ? (
          <img
            src={logoSrc}
            alt="Smriti AI"
            onError={() => setImgError(true)}
            className="size-full object-cover rounded-full"
            style={{
              objectPosition: "50% 20%",
              transform: "scale(1.35)",
            }}
          />
        ) : (
          <FallbackVectorLogo />
        )}
      </span>

      {/* Right Wordmark */}
      {withWordmark ? (
        <span className="flex flex-col justify-center leading-none">
          <span
            className="font-display font-extrabold tracking-tight text-foreground"
            style={{ fontSize: `${Math.max(0.95, size * 0.028)}rem` }}
          >
            SMRITI <span className="brand-gradient-text">AI</span>
          </span>
          {tagline ? (
            <span
              className="mt-1 font-medium text-muted-foreground tracking-wide flex items-center gap-1"
              style={{ fontSize: `${Math.max(0.65, size * 0.018)}rem` }}
            >
              <span className="opacity-40">— •</span> AI That Remembers What Matters.{" "}
              <span className="opacity-40">• —</span>
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

function FallbackVectorLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full">
      <defs>
        <linearGradient id="smriti-v-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="smriti-v-teal" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      <path
        d="M 22,76 C 32,86 58,90 76,80 C 86,74 88,64 78,58 C 68,54 58,64 44,64 C 34,64 25,58 22,76 Z"
        fill="url(#smriti-v-teal)"
        opacity="0.85"
      />
      <path
        d="M 44,64 C 41,48 34,40 24,34 C 34,30 44,36 47,44 C 51,30 44,18 36,14 C 48,14 56,24 54,36 C 64,24 74,18 80,24 C 71,30 64,36 58,44"
        stroke="url(#smriti-v-grad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="14" r="5" fill="#38BDF8" />
      <circle cx="24" cy="34" r="4.5" fill="#14B8A6" />
      <circle cx="80" cy="24" r="5" fill="#C084FC" />
      <circle cx="64" cy="52" r="15" stroke="url(#smriti-v-grad)" strokeWidth="4" fill="#0F172A" />
      <circle cx="64" cy="52" r="7" fill="url(#smriti-v-teal)" />
      <circle cx="66" cy="50" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

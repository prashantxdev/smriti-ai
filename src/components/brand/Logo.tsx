import logoAsset from "@/assets/smriti-logo.png.asset.json";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  tagline?: boolean;
};

/**
 * Smriti AI brand lockup. The uploaded artwork is cropped to its mark via
 * object-position so the wordmark below can be set in brand typography.
 */
export function Logo({ className, size = 40, withWordmark = true, tagline = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className="relative shrink-0 overflow-hidden rounded-xl bg-card ring-1 ring-border"
        style={{ width: size, height: size }}
      >
        <img
          src={logoAsset.url}
          alt="Smriti AI logo"
          className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{ width: size * 1.42, height: size * 1.42, objectFit: "cover", objectPosition: "50% 26%" }}
        />
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
            SMRITI <span className="text-primary">AI</span>
          </span>
          {tagline ? (
            <span className="mt-1 text-[0.7rem] font-medium text-muted-foreground">
              AI That Remembers What Matters.
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

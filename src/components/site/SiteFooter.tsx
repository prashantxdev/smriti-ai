import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size={44} tagline />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A memory companion for people living with memory difficulties, and for the families and
              caregivers who support them.
            </p>
          </div>

          <nav aria-label="Product" className="text-sm">
            <h2 className="font-display text-sm font-semibold text-foreground">Product</h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal" className="text-sm">
            <h2 className="font-display text-sm font-semibold text-foreground">Trust</h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 space-y-4 border-t border-border pt-8">
          <p className="rounded-2xl bg-muted px-5 py-4 text-xs leading-relaxed text-muted-foreground">
            Smriti AI is an assistive technology designed to support memory and everyday interactions. It is
            not a medical diagnosis or treatment system.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Smriti AI. AI That Remembers What Matters.
          </p>
        </div>
      </div>
    </footer>
  );
}

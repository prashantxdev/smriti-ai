import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ComingSoon({ note }: { note: string }) {
  return (
    <div className="surface-card mt-8 p-8 text-center">
      <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

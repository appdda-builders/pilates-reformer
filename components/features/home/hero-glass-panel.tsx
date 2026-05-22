import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function HeroGlassPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-primary-foreground/25 bg-primary-foreground/12 text-primary-foreground rounded-3xl border shadow-2xl backdrop-blur-2xl backdrop-saturate-150",
        className,
      )}
    >
      {children}
    </div>
  );
}

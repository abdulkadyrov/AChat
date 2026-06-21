import type { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/utils/cn";

interface SectionCardProps extends PropsWithChildren {
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section className={cn("glass-panel rounded-[24px] p-4 sm:p-5", className)}>
      {children}
    </section>
  );
}

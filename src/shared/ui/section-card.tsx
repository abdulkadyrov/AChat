import type { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/utils/cn";

interface SectionCardProps extends PropsWithChildren {
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return <section className={cn("section-card p-4", className)}>{children}</section>;
}

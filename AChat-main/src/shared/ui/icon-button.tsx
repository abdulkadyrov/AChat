import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/cn";

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/90 text-ink transition hover:scale-[1.02] dark:border-white/10 dark:bg-white/5 dark:text-white",
        className
      )}
      {...props}
    />
  );
}

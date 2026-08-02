import { useState } from "react";
import { cn } from "@/shared/lib/utils/cn";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-[52px] w-[52px] text-base",
  lg: "h-16 w-16 text-lg"
} as const;

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (src && !failed) {
    return (
      <span
        aria-label={`Аватар: ${name}`}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent-soft)] font-bold text-[var(--color-accent)]",
          sizeClasses[size],
          className
        )}
      >
        {initials || "?"}
        <img
          src={src}
          alt=""
          width={size === "sm" ? 40 : size === "lg" ? 64 : 52}
          height={size === "sm" ? 40 : size === "lg" ? 64 : 52}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center transition-opacity",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      </span>
    );
  }

  return (
    <span
      aria-label={`Аватар: ${name}`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-bold text-[var(--color-accent)]",
        sizeClasses[size],
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}

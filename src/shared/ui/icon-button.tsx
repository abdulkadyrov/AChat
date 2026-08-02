import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/cn";

export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("icon-button", className)} {...props} />;
}

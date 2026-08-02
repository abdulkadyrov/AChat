import { Avatar } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/utils/cn";

interface AvatarStackProps {
  avatars: string[];
  names?: string[];
  size?: "sm" | "md";
}

export function AvatarStack({ avatars, names = [], size = "md" }: AvatarStackProps) {
  if (avatars.length <= 1) {
    return <Avatar src={avatars[0]} name={names[0] ?? "Чат"} size={size} />;
  }

  const small = size === "sm";
  return (
    <div
      className={cn("relative shrink-0", small ? "h-10 w-10" : "h-[52px] w-[52px]")}
      aria-label="Аватары участников"
    >
      <Avatar
        src={avatars[0]}
        name={names[0] ?? "Участник"}
        size="sm"
        className={cn(
          "absolute left-0 top-0 border-2 border-[var(--color-surface)]",
          small ? "h-7 w-7" : "h-9 w-9"
        )}
      />
      <Avatar
        src={avatars[1]}
        name={names[1] ?? "Участник"}
        size="sm"
        className={cn(
          "absolute bottom-0 right-0 border-2 border-[var(--color-surface)]",
          small ? "h-7 w-7" : "h-9 w-9"
        )}
      />
    </div>
  );
}

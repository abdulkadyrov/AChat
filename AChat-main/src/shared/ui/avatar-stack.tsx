import { cn } from "@/shared/lib/utils/cn";

interface AvatarStackProps {
  avatars: string[];
  size?: "sm" | "md";
}

export function AvatarStack({ avatars, size = "md" }: AvatarStackProps) {
  const sizeClass = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  if (avatars.length === 1) {
    return (
      <img
        src={avatars[0]}
        alt=""
        className={cn(sizeClass, "rounded-full object-cover ring-2 ring-white dark:ring-[#0f1724]")}
      />
    );
  }

  return (
    <div className="flex items-center">
      {avatars.slice(0, 3).map((avatar, index) => (
        <img
          key={avatar}
          src={avatar}
          alt=""
          className={cn(
            sizeClass,
            "rounded-full object-cover ring-2 ring-white dark:ring-[#0f1724]",
            index > 0 && "-ml-3"
          )}
        />
      ))}
    </div>
  );
}

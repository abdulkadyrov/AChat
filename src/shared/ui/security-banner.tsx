import { LockKeyhole } from "lucide-react";

interface SecurityBannerProps {
  onClick: () => void;
}

export function SecurityBanner({ onClick }: SecurityBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-[var(--color-accent-soft)] px-4 py-3 text-left text-[var(--color-accent)]"
    >
      <LockKeyhole aria-hidden="true" size={19} />
      <span className="flex-1 text-[13px] font-medium">
        Сообщения защищены сквозным шифрованием
      </span>
    </button>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import {
  generateDailyParticipantCode,
  millisecondsUntilNextLocalDay
} from "@/shared/lib/invite/daily-code";
import type { UserProfile } from "@/shared/types/domain";

interface DailyParticipantCodeProps {
  user: UserProfile;
  compact?: boolean;
}

export function DailyParticipantCode({ user, compact = false }: DailyParticipantCodeProps) {
  const [today, setToday] = useState(() => new Date());
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => generateDailyParticipantCode(user, today), [today, user]);
  const formattedCode = `${code.slice(0, 4)} ${code.slice(4)}`;

  useEffect(() => {
    const timeout = window.setTimeout(() => setToday(new Date()), millisecondsUntilNextLocalDay());
    return () => window.clearTimeout(timeout);
  }, [today]);

  if (compact) {
    return (
      <span className="mt-1 block text-[12px] text-[var(--color-accent)]">
        Код сегодня: <strong className="tracking-[0.12em]">{formattedCode}</strong>
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-accent-soft)] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
          <RefreshCw aria-hidden="true" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Ваш код участника на сегодня</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
            Меняется автоматически каждый день. Это идентификатор, а не пароль.
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center rounded-xl bg-[var(--color-surface)] px-4 py-3">
        <span className="flex-1 text-[24px] font-bold tracking-[0.2em] text-[var(--color-accent)]">
          {formattedCode}
        </span>
        <button
          type="button"
          className="icon-button"
          aria-label="Копировать код участника"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? <Check aria-hidden="true" size={19} /> : <Copy aria-hidden="true" size={19} />}
        </button>
      </div>
    </div>
  );
}

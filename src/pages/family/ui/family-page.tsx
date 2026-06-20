import { QrCode, UserPlus } from "lucide-react";
import { useFamily } from "@/features/family/model/use-family";
import { MemberList } from "@/features/family/ui/member-list";
import { SectionCard } from "@/shared/ui/section-card";

export function FamilyPage() {
  const { family, members } = useFamily();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="screen-title">{family.name}</h1>
        <p className="subtle-text mt-1">Только участники семьи видят историю сообщений.</p>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-soft dark:text-slate-400">Участники</p>
        <MemberList members={members} />
      </div>
      <SectionCard className="space-y-3">
        <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 dark:border-white/10">
          <UserPlus className="h-5 w-5 text-accent" />
          <span className="font-semibold">Пригласить в семью</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 dark:border-white/10">
          <QrCode className="h-5 w-5 text-accent" />
          <span className="font-semibold">QR-код приглашения</span>
        </button>
      </SectionCard>
      <SectionCard className="text-center">
        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-[24px] border border-slate-200/80 bg-white dark:border-white/10 dark:bg-white">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ACHAT-FAMILY-2026"
            alt="Invite QR"
            className="h-44 w-44"
          />
        </div>
        <p className="mt-4 text-sm text-ink-soft dark:text-slate-400">
          Покажите этот код тому, кого хотите пригласить. Код действует 7 дней.
        </p>
      </SectionCard>
    </div>
  );
}

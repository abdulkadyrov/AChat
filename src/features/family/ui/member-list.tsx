import { MoreHorizontal } from "lucide-react";
import { relativePresence } from "@/shared/lib/utils/date";
import { Avatar } from "@/shared/ui/avatar";
import { IconButton } from "@/shared/ui/icon-button";
import type { FamilyMember, UserProfile } from "@/shared/types/domain";

export type MemberWithUser = FamilyMember & { user?: UserProfile };

interface MemberListProps {
  members: MemberWithUser[];
  ownerId: string;
  onMore: (member: MemberWithUser) => void;
}

export function MemberList({ members, ownerId, onMore }: MemberListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex min-h-[72px] items-center gap-3 border-b border-[var(--color-divider)] px-3 py-3 last:border-b-0"
        >
          <Avatar src={member.user?.avatarUrl} name={member.user?.name ?? "Участник"} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[15px] font-semibold">
                {member.user?.name ?? "Участник"}
              </p>
              {member.userId === ownerId && (
                <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
                  Владелец
                </span>
              )}
            </div>
            <p
              className={`mt-0.5 text-[12px] ${member.status === "online" ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}`}
            >
              {relativePresence(member.status)}
            </p>
          </div>
          <IconButton
            onClick={() => onMore(member)}
            aria-label={`Действия с участником ${member.user?.name ?? ""}`}
          >
            <MoreHorizontal aria-hidden="true" size={20} />
          </IconButton>
        </div>
      ))}
    </div>
  );
}

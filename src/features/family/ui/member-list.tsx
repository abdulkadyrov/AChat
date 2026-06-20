import type { FamilyMember, UserProfile } from "@/shared/types/domain";
import { relativePresence } from "@/shared/lib/utils/date";
import { SectionCard } from "@/shared/ui/section-card";

interface MemberListProps {
  members: Array<FamilyMember & { user?: UserProfile }>;
}

export function MemberList({ members }: MemberListProps) {
  return (
    <SectionCard className="p-0">
      <div className="divide-y divide-slate-200/70 dark:divide-white/10">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 px-4 py-4">
            <img
              src={member.user?.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold">{member.user?.name}</p>
                {member.role === "owner" && (
                  <span className="text-xs font-semibold text-accent">Владелец</span>
                )}
              </div>
              <p className="text-sm text-accent/90 dark:text-accent-dark">
                {relativePresence(member.status)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

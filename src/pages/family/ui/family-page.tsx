import { Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { ManageChatsSheet } from "@/features/chats/ui/manage-chats-sheet";
import { SectionCard } from "@/shared/ui/section-card";
import { useState } from "react";
import type { Chat, ChatInvite } from "@/shared/types/domain";

export function FamilyPage() {
  const [manageOpen, setManageOpen] = useState(false);
  const chats = useChatStore((state: ChatState) => state.chats);
  const invites = useChatStore((state: ChatState) => state.invites);
  const groups = chats.filter((chat: Chat) => chat.type === "group");

  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="screen-title">Группы</h1>
            <p className="subtle-text mt-1">Здесь видны созданные группы и их коды доступа.</p>
          </div>
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {groups.length === 0 ? (
          <SectionCard className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-dark">
              <Users className="h-7 w-7" />
            </div>
            <p className="mt-4 text-lg font-extrabold tracking-[-0.03em]">Групп пока нет</p>
            <p className="subtle-text mt-2">Создайте первую группу через кнопку плюс на странице чатов.</p>
          </SectionCard>
        ) : (
          <div className="space-y-3">
            {groups.map((group: Chat) => {
              const invite = invites.find((item: ChatInvite) => item.chatId === group.id);

              return (
                <SectionCard key={group.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold tracking-[-0.03em]">{group.title}</p>
                      <p className="subtle-text mt-1">
                        Разрешённых номеров: {group.memberLimit ?? "без лимита"}
                      </p>
                    </div>
                    <Link
                      to={`/chat/${group.id}`}
                      className="rounded-xl bg-accent-soft px-3 py-2 text-sm font-semibold text-accent dark:bg-accent/15 dark:text-accent-dark"
                    >
                      Открыть
                    </Link>
                  </div>
                  {invite && (
                    <div className="mt-4 rounded-2xl bg-slate-100 px-3 py-3 text-sm dark:bg-white/5">
                      <div className="mb-2 font-semibold">Код доступа</div>
                      <div className="text-lg font-black tracking-[0.25em] text-accent">
                        {invite.accessCode}
                      </div>
                    </div>
                  )}
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>
      <ManageChatsSheet
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        title="Управление группами"
        filter="group"
      />
    </>
  );
}

import { Link2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useChatStore } from "@/shared/model/chat-store";
import { SectionCard } from "@/shared/ui/section-card";

export function FamilyPage() {
  const chats = useChatStore((state) => state.chats);
  const invites = useChatStore((state) => state.invites);
  const groups = chats.filter((chat) => chat.type === "group");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="screen-title">Группы</h1>
        <p className="subtle-text mt-1">Здесь видны созданные группы и их лимиты на вход по QR.</p>
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
          {groups.map((group) => {
            const invite = invites.find((item) => item.chatId === group.id);

            return (
              <SectionCard key={group.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold tracking-[-0.03em]">{group.title}</p>
                    <p className="subtle-text mt-1">
                      Лимит участников по QR: {group.memberLimit ?? "без лимита"}
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
                  <div className="mt-4 rounded-2xl bg-slate-100 px-3 py-3 text-xs break-all dark:bg-white/5">
                    <div className="mb-2 flex items-center gap-2 font-semibold">
                      <Link2 className="h-4 w-4" />
                      Код приглашения
                    </div>
                    {invite.token}
                  </div>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

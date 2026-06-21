import { useState } from "react";
import { Plus, Settings } from "lucide-react";
import { useChats } from "@/features/chats/model/use-chats";
import { ComposeChatSheet } from "@/features/chats/ui/compose-chat-sheet";
import { EmptyChatsState } from "@/features/chats/ui/empty-chats-state";
import { ManageChatsSheet } from "@/features/chats/ui/manage-chats-sheet";
import { ChatList } from "@/entities/chat/ui/chat-list";
import { IconButton } from "@/shared/ui/icon-button";
import { SearchInput } from "@/shared/ui/search-input";
import { SectionCard } from "@/shared/ui/section-card";

export function ChatsPage() {
  const chats = useChats();
  const [search, setSearch] = useState("");
  const [isComposeOpen, setComposeOpen] = useState(false);
  const [isManageOpen, setManageOpen] = useState(false);

  const normalized = search.trim().toLowerCase();
  const filteredChats = normalized
    ? chats.filter((chat) => chat.title.toLowerCase().includes(normalized))
    : chats;

  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="screen-title">Чаты</h1>
            <p className="subtle-text mt-1">Создавайте личные чаты и группы через 6-значные коды доступа</p>
          </div>
          <IconButton onClick={() => setManageOpen(true)}>
            <Settings className="h-5 w-5" />
          </IconButton>
        </div>
        <SearchInput value={search} onChange={setSearch} />
        {filteredChats.length > 0 ? (
          <ChatList chats={filteredChats} />
        ) : (
          <EmptyChatsState onCreate={() => setComposeOpen(true)} />
        )}
        <SectionCard className="flex items-center justify-center gap-2 py-5 text-center">
          <p className="subtle-text max-w-72">
            Для личного чата можно выдать код одному 8-значному номеру, а для группы задать список разрешённых номеров.
          </p>
        </SectionCard>
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-emerald-900/20 transition hover:scale-[1.02] sm:right-[max(2rem,calc((100vw-72rem)/2+2rem))]"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>
      <ComposeChatSheet open={isComposeOpen} onClose={() => setComposeOpen(false)} />
      <ManageChatsSheet open={isManageOpen} onClose={() => setManageOpen(false)} />
    </>
  );
}

import { useState } from "react";
import { Plus, Settings } from "lucide-react";
import { useChats } from "@/features/chats/model/use-chats";
import { ChatList } from "@/entities/chat/ui/chat-list";
import { SearchInput } from "@/shared/ui/search-input";
import { IconButton } from "@/shared/ui/icon-button";
import { SectionCard } from "@/shared/ui/section-card";

export function ChatsPage() {
  const chats = useChats();
  const [search, setSearch] = useState("");

  const normalized = search.trim().toLowerCase();
  const filteredChats = normalized
    ? chats.filter((chat) => chat.title.toLowerCase().includes(normalized))
    : chats;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="screen-title">Чаты</h1>
          <p className="subtle-text mt-1">Семейный мессенджер со сквозным шифрованием</p>
        </div>
        <IconButton>
          <Settings className="h-5 w-5" />
        </IconButton>
      </div>
      <SearchInput value={search} onChange={setSearch} />
      <ChatList chats={filteredChats} />
      <SectionCard className="flex items-center justify-center gap-2 py-5 text-center">
        <p className="subtle-text max-w-56">
          Сообщения защищены сквозным шифрованием и могут удаляться автоматически.
        </p>
      </SectionCard>
      <button className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-emerald-900/20 transition hover:scale-[1.02] sm:right-[max(2rem,calc((100vw-72rem)/2+2rem))]">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}

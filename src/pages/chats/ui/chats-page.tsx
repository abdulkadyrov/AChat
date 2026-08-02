import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { ChatList } from "@/entities/chat/ui/chat-list";
import { ComposeChatSheet } from "@/features/chats/ui/compose-chat-sheet";
import { EmptyChatsState } from "@/features/chats/ui/empty-chats-state";
import { ChatRoomView } from "@/pages/chat-room/ui/chat-room-page";
import { useChats } from "@/features/chats/model/use-chats";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { IconButton } from "@/shared/ui/icon-button";
import { SearchInput } from "@/shared/ui/search-input";
import { SecurityBanner } from "@/shared/ui/security-banner";
import { Sheet } from "@/shared/ui/sheet";
import type { Chat } from "@/shared/types/domain";

function ChatListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Загрузка чатов"
      className="animate-pulse bg-[var(--color-surface)]"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-[76px] items-center gap-3 border-b border-[var(--color-divider)] px-4 py-3"
        >
          <span className="h-[52px] w-[52px] shrink-0 rounded-full bg-[var(--color-surface-secondary)]" />
          <span className="flex-1">
            <span className="block h-4 w-1/3 rounded bg-[var(--color-surface-secondary)]" />
            <span className="mt-2 block h-3 w-2/3 rounded bg-[var(--color-surface-secondary)]" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChatsPage() {
  const chats = useChats();
  const user = useAuthStore((state: AuthState) => state.user);
  const loading = useChatStore((state: ChatState) => state.loading);
  const error = useChatStore((state: ChatState) => state.error);
  const currentChatId = useChatStore((state: ChatState) => state.currentChatId);
  const setCurrentChatId = useChatStore((state: ChatState) => state.setCurrentChatId);
  const hydrateChats = useChatStore((state: ChatState) => state.hydrateChats);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  useEffect(() => {
    if (chats.length > 0 && !chats.some((chat: Chat) => chat.id === currentChatId))
      setCurrentChatId(chats[0].id);
  }, [chats, currentChatId, setCurrentChatId]);

  const normalized = search.trim().toLocaleLowerCase("ru");
  const filteredChats = useMemo(
    () =>
      normalized
        ? chats.filter((chat: Chat & { lastMessage?: { preview?: string } }) =>
            [chat.title, chat.subtitle, chat.lastMessage?.preview].some((value) =>
              value?.toLocaleLowerCase("ru").includes(normalized)
            )
          )
        : chats,
    [chats, normalized]
  );
  const selectedId = chats.some((chat: Chat) => chat.id === currentChatId)
    ? currentChatId
    : chats[0]?.id;

  const listContent = loading ? (
    <ChatListSkeleton />
  ) : error ? (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <AlertCircle aria-hidden="true" size={32} className="text-[var(--color-danger)]" />
      <p className="mt-3 font-semibold">Не удалось загрузить чаты</p>
      <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{error}</p>
      <button
        type="button"
        className="secondary-button mt-4"
        onClick={() => user && hydrateChats(user)}
      >
        <RefreshCw aria-hidden="true" size={17} /> Повторить
      </button>
    </div>
  ) : filteredChats.length > 0 ? (
    <>
      <div className="lg:hidden">
        <ChatList chats={filteredChats} />
      </div>
      <div className="hidden lg:block">
        <ChatList chats={filteredChats} selectedId={selectedId} onSelect={setCurrentChatId} />
      </div>
    </>
  ) : chats.length === 0 ? (
    <EmptyChatsState onCreate={() => setComposeOpen(true)} />
  ) : (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <p className="text-[17px] font-semibold">Ничего не найдено</p>
      <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
        Попробуйте изменить запрос
      </p>
      <button type="button" className="secondary-button mt-4" onClick={() => setSearch("")}>
        Сбросить поиск
      </button>
    </div>
  );

  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)]">
      <section
        className="page-shell border-r border-[var(--color-divider)] bg-[var(--color-surface)]"
        aria-label="Чаты"
      >
        <header className="top-bar border-b-0">
          <h1 className="screen-title flex-1">Чаты</h1>
          <IconButton onClick={() => setSecurityOpen(true)} aria-label="О защите сообщений">
            <ShieldCheck aria-hidden="true" size={22} />
          </IconButton>
          <IconButton
            onClick={() => setComposeOpen(true)}
            aria-label="Создать новый чат"
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
          >
            <Plus aria-hidden="true" size={23} />
          </IconButton>
        </header>
        <div className="px-4 pb-3">
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <div className="px-4 pb-3">
          <SecurityBanner onClick={() => setSecurityOpen(true)} />
        </div>
        {listContent}
      </section>
      <div className="hidden min-h-0 lg:block">
        {selectedId ? (
          <ChatRoomView chatId={selectedId} embedded />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--color-background)] p-8 text-center text-[var(--color-text-secondary)]">
            Выберите чат, чтобы начать общение
          </div>
        )}
      </div>
      <ComposeChatSheet open={composeOpen} onClose={() => setComposeOpen(false)} />
      <Sheet
        open={securityOpen}
        onClose={() => setSecurityOpen(false)}
        title="Защита сообщений"
        description="Содержимое сообщений шифруется до отправки и не используется для серверного поиска."
      >
        <div className="mt-4 rounded-2xl bg-[var(--color-accent-soft)] p-4 text-[13px] leading-5 text-[var(--color-text-secondary)]">
          Ключи чатов остаются на устройствах участников. При удалении участника ключ для новых
          сообщений должен быть заменён.
        </div>
        <button
          type="button"
          className="primary-button mt-4 w-full"
          onClick={() => setSecurityOpen(false)}
        >
          Понятно
        </button>
      </Sheet>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ChevronUp, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MessageBubble } from "@/entities/message/ui/message-bubble";
import { ChatHeader } from "@/features/messages/ui/chat-header";
import { ChatSettingsSheet } from "@/features/messages/ui/chat-settings-sheet";
import { MessageActionSheet } from "@/features/messages/ui/message-action-sheet";
import { MessageInput } from "@/features/messages/ui/message-input";
import {
  decryptRemoteMessage,
  fetchRemoteMessages,
  subscribeToRemoteMessages
} from "@/shared/lib/supabase/messaging";
import { formatDateDivider } from "@/shared/lib/utils/date";
import { isMessageExpired } from "@/shared/lib/ttl/messages";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import type { Chat, Message, MessageTTL } from "@/shared/types/domain";

function ttlText(ttl: MessageTTL) {
  if (ttl === "off") return null;
  const labels: Record<Exclude<MessageTTL, "off">, string> = {
    "24h": "24 часа",
    "7d": "7 дней",
    "30d": "30 дней",
    "90d": "90 дней"
  };
  return `Сообщения удаляются через ${labels[ttl]}`;
}

interface ChatRoomViewProps {
  chatId: string;
  embedded?: boolean;
}

export function ChatRoomView({ chatId, embedded = false }: ChatRoomViewProps) {
  const chats = useChatStore((state: ChatState) => state.chats);
  const chatSecretsByChatId = useChatStore((state: ChatState) => state.chatSecretsByChatId);
  const messagesByChatId = useMessageStore((state: MessageState) => state.messagesByChatId);
  const setMessages = useMessageStore((state: MessageState) => state.setMessages);
  const enqueueMessage = useMessageStore((state: MessageState) => state.enqueueMessage);
  const replyTo = useUiStore((state: UiState) => state.replyTo);
  const chat = chats.find((item: Chat) => item.id === chatId);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const previousLastIdRef = useRef<string | null>(null);
  const [actionMessageId, setActionMessageId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const [isNearBottom, setNearBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (!chat) return;
    const chatSecret = chatSecretsByChatId[chat.id];
    if (!chatSecret) return;
    let active = true;
    fetchRemoteMessages(chat.id, chatSecret)
      .then((messages) => {
        if (active) setMessages(chat.id, messages);
      })
      .catch(() => undefined);
    const channel = subscribeToRemoteMessages(chat.id, (row) => {
      decryptRemoteMessage(row, chatSecret)
        .then(enqueueMessage)
        .catch(() => undefined);
    });
    return () => {
      active = false;
      channel.unsubscribe();
    };
  }, [chat, chatSecretsByChatId, enqueueMessage, setMessages]);

  const allMessages = useMemo(
    () =>
      chat
        ? (messagesByChatId[chat.id] ?? []).filter(
            (message) => !isMessageExpired(message.expiresAt)
          )
        : [],
    [chat, messagesByChatId]
  );
  const messages = allMessages.slice(-visibleCount);
  const actionMessage =
    allMessages.find((message: Message) => message.id === actionMessageId) ?? null;
  const replyPreview = replyTo
    ? (allMessages.find((message: Message) => message.id === replyTo)?.preview ?? null)
    : null;

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior });
    setHasNewMessages(false);
  }

  useEffect(() => {
    window.requestAnimationFrame(() => scrollToBottom("auto"));
  }, [chatId]);

  useEffect(() => {
    const lastId = allMessages[allMessages.length - 1]?.id ?? null;
    if (lastId && lastId !== previousLastIdRef.current) {
      if (isNearBottom) window.requestAnimationFrame(() => scrollToBottom("smooth"));
      else if (previousLastIdRef.current) setHasNewMessages(true);
    }
    previousLastIdRef.current = lastId;
  }, [allMessages, isNearBottom]);

  function scrollToMessage(messageId: string) {
    document
      .getElementById(`message-${messageId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(messageId);
    window.setTimeout(() => setHighlightedId(null), 1200);
  }

  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[var(--color-background)] p-6 text-center">
        <MessageCircle aria-hidden="true" size={34} className="text-[var(--color-text-muted)]" />
        <h1 className="text-[18px] font-bold">Чат не найден</h1>
        <p className="max-w-sm text-[13px] text-[var(--color-text-secondary)]">
          Возможно, чат был удалён или приглашение больше не действует.
        </p>
        <Link to="/chats" className="primary-button">
          Вернуться к чатам
        </Link>
      </div>
    );
  }

  return (
    <section
      className="relative flex h-full min-h-0 flex-col bg-[var(--color-background)]"
      aria-label={`Чат ${chat.title}`}
    >
      <ChatHeader chat={chat} embedded={embedded} />
      <div
        ref={scrollerRef}
        className="chat-pattern min-h-0 flex-1 overflow-y-auto overscroll-contain py-3"
        onScroll={(event) => {
          const target = event.currentTarget;
          setNearBottom(target.scrollHeight - target.scrollTop - target.clientHeight < 96);
        }}
      >
        {visibleCount < allMessages.length && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setVisibleCount((count) => count + 30)}
            >
              <ChevronUp aria-hidden="true" size={17} /> Загрузить предыдущие
            </button>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <MessageCircle aria-hidden="true" size={26} />
            </span>
            <h2 className="mt-4 text-[17px] font-bold">Начните разговор</h2>
            <p className="mt-1 max-w-xs text-[13px] leading-5 text-[var(--color-text-secondary)]">
              Первое сообщение будет зашифровано на вашем устройстве перед отправкой.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const showDate =
                !previous ||
                new Date(previous.createdAt).toDateString() !==
                  new Date(message.createdAt).toDateString();
              const reply = message.replyTo
                ? allMessages.find((item) => item.id === message.replyTo)?.preview
                : null;
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-3 flex justify-center">
                      <span className="rounded-full bg-[var(--color-surface-elevated)] px-3 py-1 text-[11px] text-[var(--color-text-secondary)] shadow-sm">
                        {formatDateDivider(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    replyPreview={reply}
                    highlighted={highlightedId === message.id}
                    onReplyClick={scrollToMessage}
                    onOpenActions={(selected) => setActionMessageId(selected.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {hasNewMessages && (
        <button
          type="button"
          className="primary-button absolute bottom-[84px] left-1/2 z-20 -translate-x-1/2 rounded-full px-4 shadow-lg"
          onClick={() => scrollToBottom()}
        >
          <ArrowDown aria-hidden="true" size={17} /> Новые сообщения
        </button>
      )}
      <MessageInput
        chatId={chat.id}
        replyPreview={replyPreview}
        ttlLabel={ttlText(chat.messageTtl)}
        onSent={() => scrollToBottom()}
      />
      <ChatSettingsSheet chat={chat} />
      <MessageActionSheet
        message={actionMessage}
        open={Boolean(actionMessage)}
        onClose={() => setActionMessageId(null)}
      />
    </section>
  );
}

export function ChatRoomPage() {
  const { id = "" } = useParams();
  return <ChatRoomView chatId={id} />;
}

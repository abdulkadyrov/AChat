import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { MessageBubble } from "@/entities/message/ui/message-bubble";
import { ChatHeader } from "@/features/messages/ui/chat-header";
import { MessageInput } from "@/features/messages/ui/message-input";
import { ChatSettingsSheet } from "@/features/messages/ui/chat-settings-sheet";
import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";
import { isMessageExpired } from "@/shared/lib/ttl/messages";
import { SectionCard } from "@/shared/ui/section-card";

export function ChatRoomPage() {
  const { id } = useParams();
  const chats = useChatStore((state) => state.chats);
  const messagesByChatId = useMessageStore((state) => state.messagesByChatId);
  const chat = chats.find((item) => item.id === id);

  const messages = useMemo(
    () => (chat ? (messagesByChatId[chat.id] ?? []).filter((message) => !isMessageExpired(message.expiresAt)) : []),
    [chat, messagesByChatId]
  );

  if (!chat) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <SectionCard className="py-10 text-center">
          <p className="text-lg font-extrabold tracking-[-0.03em]">Чат не найден</p>
          <p className="subtle-text mt-2">Вернитесь в список чатов и создайте новый QR-приглашением.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <ChatHeader chat={chat} />
      <SectionCard className="bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] p-3 dark:bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')]">
        {messages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const reply = message.replyTo
                ? messages.find((item) => item.id === message.replyTo)?.preview
                : null;

              return <MessageBubble key={message.id} message={message} replyPreview={reply} />;
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-lg font-extrabold tracking-[-0.03em]">Пока пусто</p>
            <p className="subtle-text mt-2">
              Чат создан. Теперь можно отправить первое сообщение или поделиться QR.
            </p>
          </div>
        )}
      </SectionCard>
      <SectionCard className="py-3 text-center text-sm text-ink-soft dark:text-slate-400">
        {chat.type === "group"
          ? `Лимит участников по QR: ${chat.memberLimit ?? "не задан"}`
          : `Этот чат привязан к номеру: ${chat.targetPhone ?? "не задан"}`}
      </SectionCard>
      <MessageInput chatId={chat.id} />
      <ChatSettingsSheet chat={chat} />
    </div>
  );
}

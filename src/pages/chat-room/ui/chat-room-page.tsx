import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageBubble } from "@/entities/message/ui/message-bubble";
import { ChatHeader } from "@/features/messages/ui/chat-header";
import { MessageActionSheet } from "@/features/messages/ui/message-action-sheet";
import { MessageInput } from "@/features/messages/ui/message-input";
import { ChatSettingsSheet } from "@/features/messages/ui/chat-settings-sheet";
import {
  decryptRemoteMessage,
  fetchRemoteMessages,
  subscribeToRemoteMessages
} from "@/shared/lib/supabase/messaging";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { isMessageExpired } from "@/shared/lib/ttl/messages";
import { SectionCard } from "@/shared/ui/section-card";
import type { Chat, Message } from "@/shared/types/domain";

export function ChatRoomPage() {
  const { id } = useParams();
  const chats = useChatStore((state: ChatState) => state.chats);
  const chatSecretsByChatId = useChatStore((state: ChatState) => state.chatSecretsByChatId);
  const messagesByChatId = useMessageStore((state: MessageState) => state.messagesByChatId);
  const setMessages = useMessageStore((state: MessageState) => state.setMessages);
  const enqueueMessage = useMessageStore((state: MessageState) => state.enqueueMessage);
  const replyTo = useUiStore((state: UiState) => state.replyTo);
  const chat = chats.find((item: Chat) => item.id === id);
  const [actionMessageId, setActionMessageId] = useState<string | null>(null);

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
        .then((message) => enqueueMessage(message))
        .catch(() => undefined);
    });

    return () => {
      active = false;
      channel.unsubscribe();
    };
  }, [chat, chatSecretsByChatId, enqueueMessage, setMessages]);

  const messages = useMemo(
    () =>
      chat
        ? (messagesByChatId[chat.id] ?? []).filter((message) => !isMessageExpired(message.expiresAt))
        : [],
    [chat, messagesByChatId]
  );
  const actionMessage = messages.find((message: Message) => message.id === actionMessageId) ?? null;
  const replyPreview = replyTo ? messages.find((message: Message) => message.id === replyTo)?.preview ?? null : null;

  if (!chat) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <SectionCard className="py-10 text-center">
          <p className="text-lg font-extrabold tracking-[-0.03em]">Чат не найден</p>
          <p className="subtle-text mt-2">Вернитесь в список чатов и создайте новый чат с кодом доступа.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 pb-24">
      <ChatHeader chat={chat} />
      <SectionCard className="bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] p-3 dark:bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')]">
        {messages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const reply = message.replyTo
                ? messages.find((item) => item.id === message.replyTo)?.preview
                : null;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  replyPreview={reply}
                  onOpenActions={(selected) => setActionMessageId(selected.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-lg font-extrabold tracking-[-0.03em]">Пока пусто</p>
            <p className="subtle-text mt-2">
              Чат создан. Теперь можно отправить первое сообщение или поделиться кодом доступа.
            </p>
          </div>
        )}
      </SectionCard>
      <SectionCard className="py-3 text-center text-sm text-ink-soft dark:text-slate-400">
        {chat.type === "group"
          ? `Разрешённых номеров в группе: ${chat.memberLimit ?? "не задано"}`
          : `Этот чат привязан к номеру: ${chat.targetPhone ?? "не задан"}`}
      </SectionCard>
      <MessageInput chatId={chat.id} replyPreview={replyPreview} />
      <ChatSettingsSheet chat={chat} />
      <MessageActionSheet
        message={actionMessage}
        open={Boolean(actionMessage)}
        onClose={() => setActionMessageId(null)}
      />
    </div>
  );
}

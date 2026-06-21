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
import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";
import { useUiStore } from "@/shared/model/ui-store";
import { isMessageExpired } from "@/shared/lib/ttl/messages";
import { SectionCard } from "@/shared/ui/section-card";

export function ChatRoomPage() {
  const { id } = useParams();
  const chats = useChatStore((state) => state.chats);
  const chatSecretsByChatId = useChatStore((state) => state.chatSecretsByChatId);
  const messagesByChatId = useMessageStore((state) => state.messagesByChatId);
  const setMessages = useMessageStore((state) => state.setMessages);
  const enqueueMessage = useMessageStore((state) => state.enqueueMessage);
  const replyTo = useUiStore((state) => state.replyTo);
  const chat = chats.find((item) => item.id === id);
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
  const actionMessage = messages.find((message) => message.id === actionMessageId) ?? null;
  const replyPreview = replyTo ? messages.find((message) => message.id === replyTo)?.preview ?? null : null;

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

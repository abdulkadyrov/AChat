import { useParams } from "react-router-dom";
import { ChatHeader } from "@/features/messages/ui/chat-header";
import { MessageInput } from "@/features/messages/ui/message-input";
import { MessageBubble } from "@/entities/message/ui/message-bubble";
import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";
import { SectionCard } from "@/shared/ui/section-card";
import { isMessageExpired } from "@/shared/lib/ttl/messages";

export function ChatRoomPage() {
  const { id } = useParams();
  const chats = useChatStore((state) => state.chats);
  const messagesByChatId = useMessageStore((state) => state.messagesByChatId);
  const chat = chats.find((item) => item.id === id) ?? chats[0];

  const messages = (messagesByChatId[chat.id] ?? []).filter(
    (message) => !isMessageExpired(message.expiresAt)
  );

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <ChatHeader chat={chat} />
      <SectionCard className="bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] p-3 dark:bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')]">
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
            const reply = message.replyTo
              ? messages.find((item) => item.id === message.replyTo)?.preview
              : null;

            return <MessageBubble key={message.id} message={message} replyPreview={reply} />;
          })}
        </div>
      </SectionCard>
      <SectionCard className="py-3 text-center text-sm text-ink-soft dark:text-slate-400">
        Сообщения удаляются через 7 дней
      </SectionCard>
      <MessageInput chatId={chat.id} />
    </div>
  );
}

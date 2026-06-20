import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/model/auth-store";
import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";
import { useUiStore } from "@/shared/model/ui-store";
import { computeExpiresAt } from "@/shared/lib/ttl/messages";
import { queueOutgoingMessage } from "@/shared/lib/offline/db";
import type { Message } from "@/shared/types/domain";

interface SendMessageInput {
  chatId: string;
  content: string;
}

export function useSendMessage() {
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const enqueueMessage = useMessageStore((state) => state.enqueueMessage);
  const setSendingState = useMessageStore((state) => state.setSendingState);
  const messageTtl = useUiStore((state) => state.messageTtl);

  return useMutation({
    mutationFn: async ({ chatId, content }: SendMessageInput) => {
      if (!user) {
        throw new Error("Missing authenticated user");
      }

      setSendingState("sending");

      const createdAt = new Date().toISOString();
      const chat = chats.find((item) => item.id === chatId);
      const ttl = chat?.messageTtl ?? messageTtl;
      const message: Message = {
        id: crypto.randomUUID(),
        chatId,
        senderId: user.id,
        ciphertext: "pending-encryption",
        iv: "pending-iv",
        type: "text",
        createdAt,
        expiresAt: computeExpiresAt(createdAt, ttl),
        replyTo: null,
        preview: content,
        status: navigator.onLine ? "sent" : "sending"
      };

      if (!navigator.onLine) {
        await queueOutgoingMessage(message);
      }

      enqueueMessage(message);
      setSendingState("idle");

      return message;
    },
    onError: () => {
      setSendingState("error");
    }
  });
}

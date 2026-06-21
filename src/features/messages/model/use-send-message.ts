import { useMutation } from "@tanstack/react-query";
import { queueOutgoingMessage } from "@/shared/lib/offline/db";
import { computeExpiresAt } from "@/shared/lib/ttl/messages";
import { useAuthStore } from "@/shared/model/auth-store";
import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";
import {
  sendRemoteMediaMessage,
  sendRemoteTextMessage
} from "@/shared/lib/supabase/messaging";
import { useUiStore } from "@/shared/model/ui-store";
import type { Message, MessageTTL, MessageType } from "@/shared/types/domain";

interface SendMessageInput {
  chatId: string;
  content: string;
}

function buildLocalMessage(input: {
  chatId: string;
  senderId: string;
  ttl: MessageTTL;
  type: Extract<MessageType, "text" | "image" | "voice">;
  preview: string;
  dataUrl?: string;
  durationSec?: number;
  replyTo?: string | null;
}): Message {
  const createdAt = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    chatId: input.chatId,
    senderId: input.senderId,
    ciphertext: "",
    iv: "",
    type: input.type,
    createdAt,
    expiresAt: computeExpiresAt(createdAt, input.ttl),
    replyTo: input.replyTo ?? null,
    preview: input.preview,
    mediaDataUrl: input.dataUrl,
    durationSec: input.durationSec,
    status: "sent"
  };
}

export function useSendMessage() {
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const chatSecretsByChatId = useChatStore((state) => state.chatSecretsByChatId);
  const enqueueMessage = useMessageStore((state) => state.enqueueMessage);
  const setSendingState = useMessageStore((state) => state.setSendingState);
  const messageTtl = useUiStore((state) => state.messageTtl);
  const replyTo = useUiStore((state) => state.replyTo);
  const setReplyTo = useUiStore((state) => state.setReplyTo);

  return useMutation({
    mutationFn: async ({ chatId, content }: SendMessageInput) => {
      if (!user) {
        throw new Error("Missing authenticated user");
      }

      setSendingState("sending");

      const chat = chats.find((item) => item.id === chatId);
      const ttl = chat?.messageTtl ?? messageTtl;
      const chatSecret = chatSecretsByChatId[chatId];
      const fallbackMessage = buildLocalMessage({
        chatId,
        senderId: user.id,
        ttl,
        type: "text",
        preview: content,
        replyTo
      });

      let message = fallbackMessage;
      if (chatSecret) {
        try {
          message = await sendRemoteTextMessage({
            chatId,
            user,
            chatSecret,
            content,
            ttl,
            replyTo
          });
        } catch {
          await queueOutgoingMessage(fallbackMessage).catch(() => undefined);
        }
      } else {
        await queueOutgoingMessage(fallbackMessage).catch(() => undefined);
      }

      enqueueMessage(message);
      setReplyTo(null);
      setSendingState("idle");

      return message;
    },
    onError: () => {
      setSendingState("error");
    }
  });
}

export function useSendMediaMessage() {
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const chatSecretsByChatId = useChatStore((state) => state.chatSecretsByChatId);
  const enqueueMessage = useMessageStore((state) => state.enqueueMessage);
  const setSendingState = useMessageStore((state) => state.setSendingState);
  const messageTtl = useUiStore((state) => state.messageTtl);
  const replyTo = useUiStore((state) => state.replyTo);
  const setReplyTo = useUiStore((state) => state.setReplyTo);

  return useMutation({
    mutationFn: async (input: {
      chatId: string;
      type: "image" | "voice";
      dataUrl: string;
      preview: string;
      durationSec?: number;
    }) => {
      if (!user) throw new Error("Missing authenticated user");
      setSendingState("sending");
      const chat = chats.find((item) => item.id === input.chatId);
      const ttl = chat?.messageTtl ?? messageTtl;
      const chatSecret = chatSecretsByChatId[input.chatId];
      const fallbackMessage = buildLocalMessage({
        chatId: input.chatId,
        senderId: user.id,
        ttl,
        type: input.type,
        preview: input.preview,
        dataUrl: input.dataUrl,
        durationSec: input.durationSec,
        replyTo
      });

      let message = fallbackMessage;
      if (chatSecret) {
        try {
          message = await sendRemoteMediaMessage({
            ...input,
            user,
            chatSecret,
            ttl,
            replyTo
          });
        } catch {
          await queueOutgoingMessage(fallbackMessage).catch(() => undefined);
        }
      } else {
        await queueOutgoingMessage(fallbackMessage).catch(() => undefined);
      }

      enqueueMessage(message);
      setReplyTo(null);
      setSendingState("idle");
      return message;
    },
    onError: () => {
      setSendingState("error");
    }
  });
}

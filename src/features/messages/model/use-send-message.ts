import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/model/auth-store";
import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";
import {
  sendRemoteMediaMessage,
  sendRemoteTextMessage
} from "@/shared/lib/supabase/messaging";
import { useUiStore } from "@/shared/model/ui-store";

interface SendMessageInput {
  chatId: string;
  content: string;
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
      if (!chatSecret) {
        throw new Error("Missing chat secret on this device");
      }

      const message = await sendRemoteTextMessage({
        chatId,
        user,
        chatSecret,
        content,
        ttl,
        replyTo
      });
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
      if (!chatSecret) throw new Error("Missing chat secret on this device");

      const message = await sendRemoteMediaMessage({
        ...input,
        user,
        chatSecret,
        ttl,
        replyTo
      });
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

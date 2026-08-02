import type { Message } from "@/shared/types/domain";

export type MessageAction = "copy" | "reply" | "forward" | "delete-for-me" | "delete-for-everyone";

const deleteForEveryoneWindowMs = 48 * 60 * 60 * 1000;

export function getMessageActions(
  message: Message,
  currentUserId: string | undefined,
  now = Date.now()
): MessageAction[] {
  const actions: MessageAction[] = [];
  if (message.type === "text" && message.status !== "deleted" && message.preview)
    actions.push("copy");
  if (message.status !== "deleted") actions.push("reply", "forward");
  actions.push("delete-for-me");
  const canDeleteForEveryone =
    message.senderId === currentUserId &&
    message.status !== "deleted" &&
    now - new Date(message.createdAt).getTime() <= deleteForEveryoneWindowMs;
  if (canDeleteForEveryone) actions.push("delete-for-everyone");
  return actions;
}

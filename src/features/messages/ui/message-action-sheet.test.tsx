import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageActionSheet } from "@/features/messages/ui/message-action-sheet";
import { currentUser } from "@/shared/mocks/demo-data";
import { useAuthStore } from "@/shared/model/auth-store";
import type { Message } from "@/shared/types/domain";

describe("MessageActionSheet", () => {
  it("shows complete text actions for an own recent message", () => {
    useAuthStore.setState({ user: currentUser });
    const message: Message = {
      id: "message-actions",
      chatId: "chat-family",
      senderId: currentUser.id,
      ciphertext: "ciphertext",
      iv: "iv",
      type: "text",
      createdAt: new Date().toISOString(),
      expiresAt: null,
      replyTo: null,
      preview: "Привет",
      status: "sent"
    };
    render(<MessageActionSheet message={message} open onClose={() => undefined} />);
    expect(screen.getByText("Копировать")).toBeInTheDocument();
    expect(screen.getByText("Ответить")).toBeInTheDocument();
    expect(screen.getByText("Переслать")).toBeInTheDocument();
    expect(screen.getByText("Удалить у меня")).toBeInTheDocument();
    expect(screen.getByText("Удалить у всех")).toBeInTheDocument();
  });
});

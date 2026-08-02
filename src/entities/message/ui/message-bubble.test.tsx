import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageBubble } from "@/entities/message/ui/message-bubble";
import { currentUser } from "@/shared/mocks/demo-data";
import { useAuthStore } from "@/shared/model/auth-store";
import type { Message } from "@/shared/types/domain";

describe("MessageBubble", () => {
  it("renders outgoing text and delivery status", () => {
    useAuthStore.setState({ user: currentUser });
    const message: Message = {
      id: "message-test",
      chatId: "chat-test",
      senderId: currentUser.id,
      ciphertext: "ciphertext",
      iv: "iv",
      type: "text",
      createdAt: new Date().toISOString(),
      expiresAt: null,
      replyTo: null,
      preview: "Семейный ужин в семь",
      status: "read"
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText("Семейный ужин в семь")).toBeInTheDocument();
    expect(screen.getByLabelText("Прочитано")).toBeInTheDocument();
    expect(screen.getByLabelText("Действия с сообщением")).toBeInTheDocument();
  });
});

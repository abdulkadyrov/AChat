import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ChatListItem } from "@/entities/chat/ui/chat-list-item";
import { createDemoChats, createDemoMessages, currentUser } from "@/shared/mocks/demo-data";

describe("ChatListItem", () => {
  it("renders chat metadata and unread count", () => {
    const chat = createDemoChats(currentUser)[0];
    const messages = createDemoMessages(currentUser)[chat.id];
    const lastMessage = messages[messages.length - 1];
    render(
      <MemoryRouter>
        <ChatListItem chat={{ ...chat, lastMessage }} />
      </MemoryRouter>
    );
    expect(screen.getByText("Семья")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByLabelText("Защищённый чат")).toBeInTheDocument();
  });
});

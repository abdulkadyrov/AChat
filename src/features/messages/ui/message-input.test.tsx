import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { MessageInput } from "@/features/messages/ui/message-input";
import { currentUser } from "@/shared/mocks/demo-data";
import { useAuthStore } from "@/shared/model/auth-store";

describe("MessageInput", () => {
  it("switches from microphone to send when text appears", () => {
    useAuthStore.setState({ user: currentUser });
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MessageInput chatId="chat-family" />
      </QueryClientProvider>
    );
    expect(screen.getByLabelText("Записать голосовое сообщение")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Сообщение"), { target: { value: "Привет" } });
    expect(screen.getByLabelText("Отправить сообщение")).toBeInTheDocument();
  });
});

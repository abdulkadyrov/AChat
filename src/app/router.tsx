import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/app/root-layout";
import { ChatsPage } from "@/pages/chats/ui/chats-page";
import { ChatRoomPage } from "@/pages/chat-room/ui/chat-room-page";
import { FamilyPage } from "@/pages/family/ui/family-page";
import { SettingsPage } from "@/pages/settings/ui/settings-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/chats" replace /> },
      { path: "/chats", element: <ChatsPage /> },
      { path: "/chat/:id", element: <ChatRoomPage /> },
      { path: "/family", element: <FamilyPage /> },
      { path: "/settings", element: <SettingsPage /> }
    ]
  }
], {
  basename: import.meta.env.BASE_URL
});

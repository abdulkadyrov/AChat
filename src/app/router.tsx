import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "@/app/root-layout";
import { ChatRoomPage } from "@/pages/chat-room/ui/chat-room-page";
import { ChatsPage } from "@/pages/chats/ui/chats-page";
import { FamilyPage } from "@/pages/family/ui/family-page";
import { SettingsPage } from "@/pages/settings/ui/settings-page";

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/chats" replace />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="chat/:id" element={<ChatRoomPage />} />
          <Route path="family" element={<FamilyPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

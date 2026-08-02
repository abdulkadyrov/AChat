import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "@/app/root-layout";

const ChatsPage = lazy(() =>
  import("@/pages/chats/ui/chats-page").then((module) => ({ default: module.ChatsPage }))
);
const ChatRoomPage = lazy(() =>
  import("@/pages/chat-room/ui/chat-room-page").then((module) => ({ default: module.ChatRoomPage }))
);
const FamilyPage = lazy(() =>
  import("@/pages/family/ui/family-page").then((module) => ({ default: module.FamilyPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/settings/ui/settings-page").then((module) => ({ default: module.SettingsPage }))
);

function PageFallback() {
  return (
    <div
      role="status"
      aria-label="Загрузка страницы"
      className="flex h-full items-center justify-center bg-[var(--color-background)]"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
    </div>
  );
}

export function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Navigate to="/chats" replace />} />
            <Route path="chats" element={<ChatsPage />} />
            <Route path="chat/:id" element={<ChatRoomPage />} />
            <Route path="family" element={<FamilyPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

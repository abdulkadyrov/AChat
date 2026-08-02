import { useEffect, useState, type PropsWithChildren } from "react";
import { WifiOff } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { BottomNavigation } from "@/widgets/navigation/ui/bottom-navigation";

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const [isOnline, setOnline] = useState(navigator.onLine);
  const toast = useUiStore((state: UiState) => state.toast);
  const clearToast = useUiStore((state: UiState) => state.clearToast);
  const isChatRoom = location.pathname.startsWith("/chat/");

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 2200);
    return () => window.clearTimeout(timer);
  }, [clearToast, toast]);

  return (
    <div className="app-frame">
      {!isOnline && (
        <div className="offline-banner" role="status">
          <WifiOff aria-hidden="true" size={16} />
          Нет сети — сообщения попадут в очередь
        </div>
      )}
      <main className="app-main">{children}</main>
      {!isChatRoom && <BottomNavigation />}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

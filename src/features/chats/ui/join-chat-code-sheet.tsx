import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { Sheet } from "@/shared/ui/sheet";
import type { UserProfile } from "@/shared/types/domain";

interface JoinChatCodeSheetProps {
  open: boolean;
  onClose: () => void;
  onJoined?: () => void;
}

export function JoinChatCodeSheet({ open, onClose, onJoined }: JoinChatCodeSheetProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state: AuthState) => state.user);
  const joinByAccessCode = useChatStore((state: ChatState) => state.joinByAccessCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setJoining] = useState(false);

  if (!open || !user) return null;
  const currentUser: UserProfile = user;

  async function handleJoin() {
    setJoining(true);
    setError("");

    try {
      const joined = await joinByAccessCode({ accessCode: code, user: currentUser });
      if (!joined.ok) {
        setError(joined.reason);
        return;
      }

      setCode("");
      onClose();
      onJoined?.();
      navigate(`/chat/${joined.chatId}`);
    } finally {
      setJoining(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Ввести код вручную"
      description="Запасной вариант, если QR не сканируется. Введите короткий 6-значный код приглашения."
    >
      <input
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        placeholder="Например, A7K9Q2"
        maxLength={6}
        className="field mt-4 font-bold uppercase tracking-[0.2em]"
      />
      {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} className="secondary-button flex-1">
          Закрыть
        </button>
        <button
          type="button"
          disabled={isJoining || code.trim().length !== 6}
          onClick={handleJoin}
          className="primary-button flex-1"
        >
          {isJoining ? "Подключаем..." : "Войти"}
        </button>
      </div>
    </Sheet>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";

interface JoinChatCodeSheetProps {
  open: boolean;
  onClose: () => void;
}

export function JoinChatCodeSheet({ open, onClose }: JoinChatCodeSheetProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state: AuthState) => state.user);
  const joinByAccessCode = useChatStore((state: ChatState) => state.joinByAccessCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setJoining] = useState(false);

  if (!open || !user) return null;

  async function handleJoin() {
    setJoining(true);
    setError("");

    try {
      const joined = await joinByAccessCode({ accessCode: code, user });
      if (!joined.ok) {
        setError(joined.reason);
        return;
      }

      setCode("");
      onClose();
      navigate(`/chat/${joined.chatId}`);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <h3 className="text-lg font-extrabold">Войти по коду</h3>
        <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
          Введите 6-значный код. Вход сработает только если ваш номер разрешён в этом чате.
        </p>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Например, A7K9Q2"
          maxLength={6}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold uppercase tracking-[0.2em] outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
        />
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10"
          >
            Закрыть
          </button>
          <button
            type="button"
            disabled={isJoining || code.trim().length !== 6}
            onClick={handleJoin}
            className="flex-1 rounded-2xl bg-accent px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isJoining ? "Подключаем..." : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}

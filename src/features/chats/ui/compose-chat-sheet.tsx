import { useState } from "react";
import { KeyRound, MessagesSquare, QrCode, ScanLine, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JoinChatCodeSheet } from "@/features/chats/ui/join-chat-code-sheet";
import { JoinChatScanner } from "@/features/chats/ui/join-chat-scanner";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { AccessCodeCard } from "@/shared/ui/access-code-card";
import { QrCodeCard } from "@/shared/ui/qr-code-card";
import { Sheet } from "@/shared/ui/sheet";
import type { ChatInvite, UserProfile } from "@/shared/types/domain";

interface ComposeChatSheetProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "menu" | "direct" | "group" | "invite";

export function ComposeChatSheet({ open, onClose }: ComposeChatSheetProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state: AuthState) => state.user);
  const createDirectChat = useChatStore((state: ChatState) => state.createDirectChat);
  const createGroupChat = useChatStore((state: ChatState) => state.createGroupChat);
  const [mode, setMode] = useState<Mode>("menu");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [joinCodeOpen, setJoinCodeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [groupCount, setGroupCount] = useState("5");
  const [invite, setInvite] = useState<ChatInvite | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  if (!open || !user) return null;
  const currentUser: UserProfile = user;
  const sheetTitle =
    mode === "menu"
      ? "Новый чат"
      : mode === "direct"
        ? "Личный чат"
        : mode === "group"
          ? "Новая группа"
          : "QR-приглашение";

  function resetState() {
    setScannerOpen(false);
    setJoinCodeOpen(false);
    setMode("menu");
    setTitle("");
    setGroupCount("5");
    setInvite(null);
    setError("");
    setCreating(false);
    onClose();
  }

  async function handleDirectCreate() {
    setCreating(true);
    setError("");
    try {
      const createdInvite = await createDirectChat({ title, user: currentUser });
      setInvite(createdInvite);
      setMode("invite");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Не удалось создать чат.");
    } finally {
      setCreating(false);
    }
  }

  async function handleGroupCreate() {
    setCreating(true);
    setError("");
    try {
      const createdInvite = await createGroupChat({
        title,
        memberLimit: Number(groupCount),
        user: currentUser
      });
      setInvite(createdInvite);
      setMode("invite");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Не удалось создать группу.");
    } finally {
      setCreating(false);
    }
  }

  function openScanner() {
    setScannerOpen(true);
  }

  return (
    <>
      <Sheet open={open && !scannerOpen && !joinCodeOpen} onClose={resetState} title={sheetTitle}>
        {mode === "menu" && (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={openScanner}
              className="flex w-full items-center gap-4 rounded-2xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-4 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
                <ScanLine aria-hidden="true" size={23} />
              </span>
              <div>
                <p className="font-semibold">Сканировать QR-код</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Самый быстрый способ войти в чат — без номеров и длинных форм.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("direct")}
              className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-4 text-left"
            >
              <MessagesSquare className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Создать личный чат</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Придумайте название и покажите QR одному человеку.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("group")}
              className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-4 text-left"
            >
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Создать группу</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Укажите название и сколько человек смогут войти по QR.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setJoinCodeOpen(true)}
              className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)]"
            >
              <KeyRound aria-hidden="true" size={17} /> Ввести код вручную
            </button>
          </div>
        )}

        {mode === "direct" && (
          <div className="mt-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Название чата</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например, Мама"
                className="field"
                autoFocus
              />
            </label>
            <p className="mt-3 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <QrCode aria-hidden="true" size={18} className="text-[var(--color-accent)]" />
              Номер участника не нужен. После создания появится QR-код.
            </p>
            {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
            <button
              type="button"
              onClick={handleDirectCreate}
              disabled={creating || !title.trim()}
              className="primary-button mt-4 w-full"
            >
              {creating ? "Создаём..." : "Создать QR-приглашение"}
            </button>
          </div>
        )}

        {mode === "group" && (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Название группы</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например, Родные"
                className="field"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Сколько человек смогут войти</span>
              <input
                value={groupCount}
                onChange={(event) => setGroupCount(event.target.value)}
                type="number"
                min={1}
                max={50}
                className="field"
              />
            </label>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Номера вводить не нужно — просто покажите один QR приглашённым людям.
            </p>
            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
            <button
              type="button"
              onClick={handleGroupCreate}
              disabled={creating || !title.trim() || Number(groupCount) < 1}
              className="primary-button w-full"
            >
              {creating ? "Создаём..." : "Создать QR-приглашение"}
            </button>
          </div>
        )}

        {mode === "invite" && invite && (
          <div className="mt-4">
            <QrCodeCard value={invite.token} title="Покажите QR участнику" />
            <p className="mt-4 text-center text-sm leading-5 text-[var(--color-text-secondary)]">
              В AChat нужно нажать «Новый чат» → «Сканировать QR-код».
            </p>
            <details className="mt-4 rounded-2xl border border-[var(--color-border)] p-3">
              <summary className="cursor-pointer text-center text-sm font-semibold">
                Не получается сканировать?
              </summary>
              <div className="mt-3">
                <AccessCodeCard value={invite.accessCode} />
              </div>
            </details>
            <button
              type="button"
              className="primary-button mt-4 w-full"
              onClick={() => {
                resetState();
                navigate(`/chat/${invite.chatId}`);
              }}
            >
              Открыть чат
            </button>
          </div>
        )}

        {mode !== "invite" && (
          <div className="mt-5 flex gap-3">
            {mode !== "menu" && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("menu");
                }}
                className="secondary-button flex-1"
              >
                Назад
              </button>
            )}
            <button type="button" onClick={resetState} className="secondary-button flex-1">
              Закрыть
            </button>
          </div>
        )}
      </Sheet>

      <JoinChatScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onJoined={resetState}
      />
      <JoinChatCodeSheet
        open={joinCodeOpen}
        onClose={() => setJoinCodeOpen(false)}
        onJoined={resetState}
      />
    </>
  );
}

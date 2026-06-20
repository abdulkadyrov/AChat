import { useState } from "react";
import { MessagesSquare, QrCode, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JoinChatScanner } from "@/features/chats/ui/join-chat-scanner";
import { useAuthStore } from "@/shared/model/auth-store";
import { useChatStore } from "@/shared/model/chat-store";
import { QrCodeCard } from "@/shared/ui/qr-code-card";
import type { ChatInvite, UserProfile } from "@/shared/types/domain";

interface ComposeChatSheetProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "menu" | "direct" | "group" | "qr";

export function ComposeChatSheet({ open, onClose }: ComposeChatSheetProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const createDirectChat = useChatStore((state) => state.createDirectChat);
  const createGroupChat = useChatStore((state) => state.createGroupChat);
  const [mode, setMode] = useState<Mode>("menu");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [groupLimit, setGroupLimit] = useState("3");
  const [invite, setInvite] = useState<ChatInvite | null>(null);

  if (!open || !user) return null;
  const currentUser: UserProfile = user;

  function resetState() {
    setMode("menu");
    setTitle("");
    setRecipientPhone("");
    setGroupLimit("3");
    setInvite(null);
    onClose();
  }

  function handleDirectCreate() {
    if (!title.trim() || !recipientPhone.trim()) return;
    const createdInvite = createDirectChat({
      title,
      recipientPhone,
      user: currentUser
    });
    setInvite(createdInvite);
    setMode("qr");
    navigate(`/chat/${createdInvite.chatId}`);
  }

  function handleGroupCreate() {
    if (!title.trim()) return;
    const createdInvite = createGroupChat({
      title,
      memberLimit: Number(groupLimit) || 1,
      user: currentUser
    });
    setInvite(createdInvite);
    setMode("qr");
    navigate(`/chat/${createdInvite.chatId}`);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
          <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />

          {mode === "menu" && (
            <>
              <h3 className="text-lg font-extrabold">Новый чат</h3>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setMode("direct")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 text-left dark:border-white/10"
                >
                  <MessagesSquare className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-semibold">Личный чат</p>
                    <p className="text-sm text-ink-soft dark:text-slate-400">
                      Создается QR-код, который сработает только для указанного номера телефона.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("group")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 text-left dark:border-white/10"
                >
                  <Users className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-semibold">Группа</p>
                    <p className="text-sm text-ink-soft dark:text-slate-400">
                      Создатель задает лимит участников, которые войдут по QR.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 text-left dark:border-white/10"
                >
                  <QrCode className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-semibold">Подключиться по коду</p>
                    <p className="text-sm text-ink-soft dark:text-slate-400">
                      Откроется сканер камеры, как в банковских приложениях, плюс выбор QR из галереи.
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {mode === "direct" && (
            <>
              <h3 className="text-lg font-extrabold">Личный чат</h3>
              <div className="mt-4 space-y-3">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Название чата"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
                <input
                  value={recipientPhone}
                  onChange={(event) => setRecipientPhone(event.target.value)}
                  placeholder="Телефон человека, который сможет войти"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
              </div>
              <button
                type="button"
                onClick={handleDirectCreate}
                className="mt-4 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
              >
                Создать QR-код
              </button>
            </>
          )}

          {mode === "group" && (
            <>
              <h3 className="text-lg font-extrabold">Новая группа</h3>
              <div className="mt-4 space-y-3">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Название группы"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
                <input
                  value={groupLimit}
                  onChange={(event) => setGroupLimit(event.target.value)}
                  type="number"
                  min={1}
                  max={50}
                  placeholder="Лимит участников"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
              </div>
              <button
                type="button"
                onClick={handleGroupCreate}
                className="mt-4 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
              >
                Создать QR-код группы
              </button>
            </>
          )}

          {mode === "qr" && invite && (
            <>
              <h3 className="text-lg font-extrabold">QR-код приглашения</h3>
              <div className="mt-4">
                <QrCodeCard value={invite.token} />
                <p className="mt-4 text-center text-sm text-ink-soft dark:text-slate-400">
                  {invite.kind === "direct"
                    ? `Сканировать этот QR сможет только номер ${invite.allowedPhone}.`
                    : `В группу по этому QR смогут войти максимум ${invite.maxParticipants} человек(а) помимо создателя.`}
                </p>
              </div>
            </>
          )}

          <div className="mt-5 flex gap-3">
            {mode !== "menu" && (
              <button
                type="button"
                onClick={() => setMode("menu")}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10"
              >
                Назад
              </button>
            )}
            <button
              type="button"
              onClick={resetState}
              className="flex-1 rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
      <JoinChatScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </>
  );
}

import { useState } from "react";
import { KeyRound, MessagesSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JoinChatCodeSheet } from "@/features/chats/ui/join-chat-code-sheet";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { AccessCodeCard } from "@/shared/ui/access-code-card";
import { Sheet } from "@/shared/ui/sheet";
import { parsePhoneList } from "@/shared/lib/invite/token";
import type { ChatInvite, UserProfile } from "@/shared/types/domain";

interface ComposeChatSheetProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "menu" | "direct" | "group" | "code";

export function ComposeChatSheet({ open, onClose }: ComposeChatSheetProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state: AuthState) => state.user);
  const createDirectChat = useChatStore((state: ChatState) => state.createDirectChat);
  const createGroupChat = useChatStore((state: ChatState) => state.createGroupChat);
  const [mode, setMode] = useState<Mode>("menu");
  const [joinCodeOpen, setJoinCodeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [groupCount, setGroupCount] = useState("");
  const [groupPhones, setGroupPhones] = useState("");
  const [invite, setInvite] = useState<ChatInvite | null>(null);
  const [error, setError] = useState("");

  if (!open || !user) return null;
  const currentUser: UserProfile = user;
  const sheetTitle =
    mode === "menu"
      ? "Новый чат"
      : mode === "direct"
        ? "Личный чат"
        : mode === "group"
          ? "Новая группа"
          : "Код доступа";

  function resetState() {
    setMode("menu");
    setTitle("");
    setRecipientPhone("");
    setGroupCount("");
    setGroupPhones("");
    setInvite(null);
    setError("");
    onClose();
  }

  async function handleDirectCreate() {
    setError("");
    try {
      const createdInvite = await createDirectChat({
        title,
        recipientPhone,
        user: currentUser
      });
      setInvite(createdInvite);
      setMode("code");
      navigate(`/chat/${createdInvite.chatId}`);
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Не удалось создать личный чат."
      );
    }
  }

  async function handleGroupCreate() {
    setError("");
    const phones = parsePhoneList(groupPhones);
    const requestedCount = Number(groupCount) || 0;

    if (!title.trim()) {
      setError("Введите название группы.");
      return;
    }

    if (requestedCount <= 0) {
      setError("Укажите количество участников группы.");
      return;
    }

    if (phones.length !== requestedCount) {
      setError("Количество номеров должно совпадать с указанным количеством участников.");
      return;
    }

    try {
      const createdInvite = await createGroupChat({
        title,
        memberPhones: phones,
        user: currentUser
      });
      setInvite(createdInvite);
      setMode("code");
      navigate(`/chat/${createdInvite.chatId}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Не удалось создать группу.");
    }
  }

  return (
    <>
      <Sheet open={open} onClose={resetState} title={sheetTitle}>
        {mode === "menu" && (
          <>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setMode("direct")}
                className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-4 text-left"
              >
                <MessagesSquare className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold">Личный чат</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Имя чата и один 8-значный номер, которому разрешён вход.
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
                  <p className="font-semibold">Группа</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Имя группы, количество участников и список уникальных 8-значных номеров.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setJoinCodeOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-4 text-left"
              >
                <KeyRound className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold">Войти по коду</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Введите 6-значный код из букв и цифр.
                  </p>
                </div>
              </button>
            </div>
          </>
        )}

        {mode === "direct" && (
          <>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Имя чата"
                className="field"
              />
              <input
                value={recipientPhone}
                onChange={(event) => setRecipientPhone(event.target.value)}
                placeholder="8-значный номер участника"
                inputMode="numeric"
                className="field"
              />
            </div>
            {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
            <button
              type="button"
              onClick={handleDirectCreate}
              className="primary-button mt-4 w-full"
            >
              Создать код доступа
            </button>
          </>
        )}

        {mode === "group" && (
          <>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Имя группы"
                className="field"
              />
              <input
                value={groupCount}
                onChange={(event) => setGroupCount(event.target.value)}
                type="number"
                min={1}
                max={50}
                placeholder="Количество участников"
                className="field"
              />
              <textarea
                value={groupPhones}
                onChange={(event) => setGroupPhones(event.target.value)}
                rows={5}
                placeholder="Номера участников через запятую, пробел или новую строку"
                className="field"
              />
            </div>
            {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
            <button
              type="button"
              onClick={handleGroupCreate}
              className="primary-button mt-4 w-full"
            >
              Создать код доступа группы
            </button>
          </>
        )}

        {mode === "code" && invite && (
          <>
            <div className="mt-4">
              <AccessCodeCard value={invite.accessCode} />
              <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
                {invite.kind === "direct"
                  ? `Войти сможет только номер ${invite.allowedPhones[0]}.`
                  : `Войти смогут только указанные номера. Всего мест: ${invite.maxParticipants}.`}
              </p>
            </div>
          </>
        )}

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
          <button type="button" onClick={resetState} className="primary-button flex-1">
            Закрыть
          </button>
        </div>
      </Sheet>
      <JoinChatCodeSheet open={joinCodeOpen} onClose={() => setJoinCodeOpen(false)} />
    </>
  );
}

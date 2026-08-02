import { useMemo, useState } from "react";
import { Copy, QrCode, RefreshCw, Share2, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { MemberList, type MemberWithUser } from "@/features/family/ui/member-list";
import { useFamily } from "@/features/family/model/use-family";
import { AutoDeleteSheet } from "@/features/settings/ui/auto-delete-sheet";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { IconButton } from "@/shared/ui/icon-button";
import { QrCodeCard } from "@/shared/ui/qr-code-card";
import { Sheet } from "@/shared/ui/sheet";
import type { Chat, ChatInvite } from "@/shared/types/domain";

type FamilyTab = "members" | "invite" | "settings";

export function FamilyPage() {
  const { family, members } = useFamily();
  const chats = useChatStore((state: ChatState) => state.chats);
  const invites = useChatStore((state: ChatState) => state.invites);
  const rotateInvite = useChatStore((state: ChatState) => state.rotateInvite);
  const showToast = useUiStore((state: UiState) => state.showToast);
  const setModalState = useUiStore((state: UiState) => state.setModalState);
  const [tab, setTab] = useState<FamilyTab>("members");
  const [selectedMember, setSelectedMember] = useState<MemberWithUser | null>(null);
  const [removedMemberIds, setRemovedMemberIds] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState(family?.ownerId ?? "");
  const [qrOpen, setQrOpen] = useState(false);
  const [familyName, setFamilyName] = useState(family?.name ?? "Семья");

  const groupChat = chats.find((chat: Chat) => chat.type === "group");
  const invite = invites.find((item: ChatInvite) => item.chatId === groupChat?.id);
  const visibleMembers = useMemo(
    () => members.filter((member) => !removedMemberIds.includes(member.id)),
    [members, removedMemberIds]
  );

  if (!family) return null;

  async function copyInvite() {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.accessCode);
    showToast("Код приглашения скопирован");
  }

  async function shareInvite() {
    if (!invite) return;
    const text = `Присоединяйтесь к семье «${familyName}» в AChat. Код: ${invite.accessCode}`;
    if (navigator.share)
      await navigator.share({ title: "Приглашение в семью", text }).catch(() => undefined);
    else {
      await navigator.clipboard.writeText(text);
      showToast("Приглашение скопировано");
    }
  }

  function regenerateInvite() {
    if (!groupChat) return;
    const next = rotateInvite(groupChat.id);
    if (next) showToast("Создан новый код. Старый отозван");
  }

  return (
    <div className="page-shell bg-[var(--color-background)]">
      <header className="top-bar">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-[20px] font-bold">
            {familyName}
            <ShieldCheck
              aria-label="Защищённая семья"
              size={16}
              className="text-[var(--color-text-secondary)]"
            />
          </h1>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            {visibleMembers.length} участника
          </p>
        </div>
        <IconButton onClick={() => setTab("invite")} aria-label="Пригласить участника">
          <UserPlus aria-hidden="true" size={21} />
        </IconButton>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-6">
        <div className="sticky top-14 z-10 -mx-4 grid grid-cols-3 border-b border-[var(--color-divider)] bg-[var(--color-background)] px-4">
          {(
            [
              ["members", "Участники"],
              ["invite", "Приглашение"],
              ["settings", "Настройки"]
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`min-h-12 border-b-2 text-[13px] font-medium ${tab === value ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-[var(--color-text-secondary)]"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "members" && (
          <div className="pt-4">
            <MemberList members={visibleMembers} ownerId={ownerId} onMore={setSelectedMember} />
            <button
              type="button"
              className="secondary-button mt-4 w-full justify-start border-0 bg-[var(--color-surface)]"
              onClick={() => setTab("invite")}
            >
              <UserPlus aria-hidden="true" size={20} className="text-[var(--color-accent)]" />{" "}
              Пригласить в семью
            </button>
            <div className="mt-4 flex items-start gap-3 px-2 text-[12px] leading-5 text-[var(--color-text-secondary)]">
              <ShieldCheck
                aria-hidden="true"
                size={18}
                className="mt-0.5 shrink-0 text-[var(--color-accent)]"
              />{" "}
              Только участники семьи могут видеть историю сообщений.
            </div>
          </div>
        )}

        {tab === "invite" && (
          <div className="space-y-4 pt-4">
            <div className="section-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <UserPlus aria-hidden="true" size={21} />
                </span>
                <div>
                  <h2 className="font-semibold">Пригласить в семью</h2>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--color-text-secondary)]">
                    Код действует только для разрешённых номеров и отзывается при перевыпуске.
                  </p>
                </div>
              </div>
              {invite ? (
                <div className="mt-4 rounded-2xl bg-[var(--color-surface-secondary)] p-4 text-center">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Код приглашения
                  </p>
                  <p className="mt-2 text-[28px] font-bold tracking-[0.28em] text-[var(--color-accent)]">
                    {invite.accessCode}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button type="button" className="secondary-button" onClick={copyInvite}>
                      <Copy aria-hidden="true" size={17} /> Копировать
                    </button>
                    <button type="button" className="primary-button" onClick={shareInvite}>
                      <Share2 aria-hidden="true" size={17} /> Поделиться
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-[13px] text-[var(--color-text-secondary)]">
                  Создайте семейный чат, чтобы получить приглашение.
                </p>
              )}
            </div>
            {invite && (
              <button
                type="button"
                className="secondary-button min-h-[64px] w-full justify-start bg-[var(--color-surface)]"
                onClick={() => setQrOpen(true)}
              >
                <QrCode aria-hidden="true" size={24} className="text-[var(--color-accent)]" />
                <span className="text-left">
                  <span className="block font-semibold">QR-код приглашения</span>
                  <span className="text-[11px] font-normal text-[var(--color-text-secondary)]">
                    Открыть код на весь экран
                  </span>
                </span>
              </button>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4 pt-4">
            <label className="block section-card p-4">
              <span className="mb-2 block text-[13px] font-semibold">Название семьи</span>
              <input
                className="field"
                value={familyName}
                onChange={(event) => setFamilyName(event.target.value)}
              />
              <button
                type="button"
                className="primary-button mt-3 w-full"
                disabled={!familyName.trim()}
                onClick={() => showToast("Название семьи обновлено")}
              >
                Сохранить название
              </button>
            </label>
            <button
              type="button"
              className="secondary-button min-h-[60px] w-full justify-between bg-[var(--color-surface)]"
              onClick={() => setModalState("auto-delete")}
            >
              <span>Автоудаление сообщений</span>
              <span className="text-[13px] text-[var(--color-text-secondary)]">7 дней</span>
            </button>
            <button
              type="button"
              className="danger-button min-h-[60px] w-full justify-start"
              onClick={() => showToast("Для удаления семьи требуется повторная авторизация")}
            >
              <Trash2 aria-hidden="true" size={20} /> Удалить семью
            </button>
          </div>
        )}
      </div>

      <Sheet
        open={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        title={selectedMember?.user?.name ?? "Участник"}
      >
        {selectedMember && selectedMember.userId !== ownerId ? (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              className="secondary-button w-full"
              onClick={() => {
                setOwnerId(selectedMember.userId);
                setSelectedMember(null);
                showToast("Роль владельца передана");
              }}
            >
              Передать роль владельца
            </button>
            <button
              type="button"
              className="danger-button w-full"
              onClick={() => {
                setRemovedMemberIds((ids) => [...ids, selectedMember.id]);
                setSelectedMember(null);
                showToast("Доступ отозван. Ключ новых сообщений будет заменён");
              }}
            >
              Удалить из семьи
            </button>
          </div>
        ) : (
          <p className="mt-4 text-[13px] text-[var(--color-text-secondary)]">
            Владелец может управлять участниками и приглашениями.
          </p>
        )}
      </Sheet>

      <Sheet
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="QR-код приглашения"
        description="Покажите этот код только человеку, которого хотите добавить в семью."
      >
        {invite && (
          <div className="mt-4">
            <QrCodeCard value={invite.token} />
            <p className="mt-3 text-center text-[12px] text-[var(--color-text-secondary)]">
              Действует 24 часа · код {invite.accessCode}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" className="secondary-button" onClick={regenerateInvite}>
                <RefreshCw aria-hidden="true" size={17} /> Новый код
              </button>
              <button type="button" className="primary-button" onClick={shareInvite}>
                <Share2 aria-hidden="true" size={17} /> Поделиться
              </button>
            </div>
          </div>
        )}
      </Sheet>
      <AutoDeleteSheet />
    </div>
  );
}

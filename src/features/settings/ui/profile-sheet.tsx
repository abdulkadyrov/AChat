import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { Avatar } from "@/shared/ui/avatar";
import { DailyParticipantCode } from "@/shared/ui/daily-participant-code";
import { Sheet } from "@/shared/ui/sheet";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProfileSheet() {
  const modalState = useUiStore((state: UiState) => state.modalState);
  const setModalState = useUiStore((state: UiState) => state.setModalState);
  const showToast = useUiStore((state: UiState) => state.showToast);
  const user = useAuthStore((state: AuthState) => state.user);
  const updateProfile = useAuthStore((state: AuthState) => state.updateProfile);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const open = modalState === "profile";

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setPhone(user.phone);
      setAbout(user.about);
      setAvatarUrl(user.avatarUrl);
    }
  }, [open, user]);

  if (!user) return null;
  const valid = name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 8;

  function close() {
    setModalState(null);
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Профиль"
      description="Эти данные видят участники вашей семьи."
    >
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="relative rounded-full"
          onClick={() => fileRef.current?.click()}
          aria-label="Выбрать фотографию профиля"
        >
          <Avatar src={avatarUrl} name={name || user.name} size="lg" className="h-20 w-20" />
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
            <Camera aria-hidden="true" size={16} />
          </span>
        </button>
        <input
          ref={fileRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) setAvatarUrl(await fileToDataUrl(file));
          }}
        />
      </div>
      <div className="mt-5">
        <DailyParticipantCode user={user} />
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium">Имя</span>
          <input
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium">Телефон</span>
          <input
            className="field"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium">О себе</span>
          <textarea
            className="field min-h-24 resize-none"
            value={about}
            maxLength={140}
            onChange={(event) => setAbout(event.target.value)}
          />
          <span className="mt-1 block text-right text-[11px] text-[var(--color-text-muted)]">
            {about.length}/140
          </span>
        </label>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" className="secondary-button" onClick={close}>
          Отмена
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={!valid}
          onClick={() => {
            updateProfile({ name, phone, about, avatarUrl });
            showToast("Профиль обновлён");
            close();
          }}
        >
          Сохранить
        </button>
      </div>
    </Sheet>
  );
}

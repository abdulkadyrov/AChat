import { useEffect, useState } from "react";
import { useAuthStore } from "@/shared/model/auth-store";
import { useUiStore } from "@/shared/model/ui-store";

export function ProfileSheet() {
  const modalState = useUiStore((state) => state.modalState);
  const setModalState = useUiStore((state) => state.setModalState);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    if (modalState === "profile" && user) {
      setName(user.name);
      setPhone(user.phone);
      setAbout(user.about);
    }
  }, [modalState, user]);

  if (modalState !== "profile" || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <h3 className="text-lg font-extrabold">Профиль</h3>
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Имя"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Телефон"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <textarea
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            rows={3}
            placeholder="О себе"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setModalState(null)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              updateProfile({ name, phone, about });
              setModalState(null);
            }}
            className="flex-1 rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

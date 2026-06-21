import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/shared/model/auth-store";
import { SectionCard } from "@/shared/ui/section-card";

export function AuthPage() {
  const signInLocal = useAuthStore((state) => state.signInLocal);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");

  const isDisabled = !name.trim() || !phone.trim();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-10">
      <SectionCard className="w-full p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-[-0.04em]">AChat</h1>
            <p className="subtle-text">Вход в локальный MVP-профиль</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Имя</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Например, Алекс"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Телефон</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 900 000-00-00"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">О себе</span>
            <textarea
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              rows={3}
              placeholder="Короткий статус"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={isDisabled}
          onClick={() => signInLocal({ name, phone, about })}
          className="mt-6 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Войти в приложение
        </button>
      </SectionCard>
    </div>
  );
}

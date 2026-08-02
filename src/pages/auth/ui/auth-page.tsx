import { useState, type FormEvent } from "react";
import { ShieldCheck, Users } from "lucide-react";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";

export function AuthPage() {
  const signInLocal = useAuthStore((state: AuthState) => state.signInLocal);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const valid = name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 8;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (valid) signInLocal({ name, phone, about });
  }

  return (
    <main className="flex min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl shadow-black/5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white">
            <ShieldCheck aria-hidden="true" size={25} />
          </span>
          <div>
            <h1 className="text-[24px] font-bold tracking-tight">AChat</h1>
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Защищённый семейный мессенджер
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[var(--color-accent-soft)] p-3 text-[12px] leading-5 text-[var(--color-text-secondary)]">
          <Users
            aria-hidden="true"
            size={19}
            className="mt-0.5 shrink-0 text-[var(--color-accent)]"
          />{" "}
          Создайте локальный профиль. После подключения Supabase этот экран можно заменить на
          OTP-вход без изменения остального интерфейса.
        </div>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Ваше имя</span>
            <input
              className="field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Например, Папа"
              autoComplete="name"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Телефон</span>
            <input
              className="field"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 999 123-45-67"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">
              О себе{" "}
              <span className="font-normal text-[var(--color-text-muted)]">· необязательно</span>
            </span>
            <textarea
              className="field min-h-20 resize-none"
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              placeholder="Короткий семейный статус"
              maxLength={140}
            />
          </label>
          <button type="submit" className="primary-button w-full" disabled={!valid}>
            Войти в приложение
          </button>
        </form>
        <div className="my-4 flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
          <span className="h-px flex-1 bg-[var(--color-divider)]" />
          или
          <span className="h-px flex-1 bg-[var(--color-divider)]" />
        </div>
        <button
          type="button"
          className="secondary-button w-full"
          onClick={() =>
            signInLocal({ name: "Папа", phone: "+7 999 123-45-67", about: "Всегда на связи" })
          }
        >
          Открыть демо-семью
        </button>
      </div>
    </main>
  );
}

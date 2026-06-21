import { useUiStore, type UiState } from "@/shared/model/ui-store";

const content = {
  notifications: {
    title: "Уведомления",
    text: "Push-уведомления еще не подключены к браузеру. Этот раздел пока описывает будущую интеграцию."
  },
  security: {
    title: "Безопасность",
    text: "В MVP ключи и настройки живут локально у клиента, а серверный слой шифрования будет подключаться через Supabase."
  },
  about: {
    title: "О приложении",
    text: "Сейчас это MVP-прототип. Профиль, тема и локальные настройки уже рабочие, а семейные чаты пока остаются demo-контентом."
  },
  "chat-settings": {
    title: "Настройки чата",
    text: "Отдельная страница настроек чата пока не вынесена, но меню уже подключено и больше не является пустой кнопкой."
  }
} as const;

export function InfoSheet() {
  const modalState = useUiStore((state: UiState) => state.modalState);
  const setModalState = useUiStore((state: UiState) => state.setModalState);

  if (
    modalState !== "notifications" &&
    modalState !== "security" &&
    modalState !== "about" &&
    modalState !== "chat-settings"
  ) {
    return null;
  }

  const details = content[modalState];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <h3 className="text-lg font-extrabold">{details.title}</h3>
        <p className="mt-3 text-sm leading-6 text-ink-soft dark:text-slate-400">{details.text}</p>
        <button
          type="button"
          onClick={() => setModalState(null)}
          className="mt-5 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

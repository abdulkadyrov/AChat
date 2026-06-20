import { MessageSquarePlus } from "lucide-react";
import { SectionCard } from "@/shared/ui/section-card";

interface EmptyChatsStateProps {
  onCreate: () => void;
}

export function EmptyChatsState({ onCreate }: EmptyChatsStateProps) {
  return (
    <SectionCard className="py-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-dark">
        <MessageSquarePlus className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em]">Пока нет чатов</h2>
      <p className="subtle-text mx-auto mt-2 max-w-72">
        Создайте личный чат или группу через кнопку плюс. Для личного чата QR можно привязать к конкретному номеру.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-2xl bg-accent px-5 py-3 font-semibold text-white"
      >
        Создать чат
      </button>
    </SectionCard>
  );
}

import { Camera, FileText, Image, Mic, UserRound } from "lucide-react";
import { Sheet } from "@/shared/ui/sheet";

type AttachmentKind = "camera" | "gallery" | "file" | "voice";

interface AttachmentSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (kind: AttachmentKind) => void;
}

const items = [
  { kind: "camera" as const, label: "Камера", description: "Снять новое фото", icon: Camera },
  { kind: "gallery" as const, label: "Фото", description: "Выбрать из галереи", icon: Image },
  { kind: "file" as const, label: "Файл", description: "Документ или архив", icon: FileText },
  { kind: "voice" as const, label: "Голосовое", description: "Начать запись", icon: Mic }
];

export function AttachmentSheet({ open, onClose, onSelect }: AttachmentSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Вложение">
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.kind}
              type="button"
              className="flex min-h-[84px] items-center gap-3 rounded-2xl bg-[var(--color-surface-secondary)] p-3 text-left"
              onClick={() => onSelect(item.kind)}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Icon aria-hidden="true" size={20} />
              </span>
              <span>
                <span className="block font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-[11px] text-[var(--color-text-secondary)]">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
        <div
          className="col-span-2 flex min-h-11 items-center gap-3 rounded-2xl border border-[var(--color-border)] px-3 text-[var(--color-text-muted)]"
          aria-disabled="true"
        >
          <UserRound aria-hidden="true" size={20} />
          <span className="text-[13px]">Контакты появятся после подключения адресной книги</span>
        </div>
      </div>
    </Sheet>
  );
}

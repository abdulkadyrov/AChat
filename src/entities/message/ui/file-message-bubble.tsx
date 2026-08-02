import { Download, FileText } from "lucide-react";
import type { Message } from "@/shared/types/domain";

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function FileMessageBubble({ message }: { message: Message }) {
  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <FileText aria-hidden="true" size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold">
          {message.fileName ?? message.preview ?? "Файл"}
        </span>
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          {formatBytes(message.fileSize)}
        </span>
      </span>
      {message.mediaDataUrl && (
        <a
          href={message.mediaDataUrl}
          download={message.fileName}
          className="icon-button"
          aria-label="Скачать файл"
        >
          <Download aria-hidden="true" size={19} />
        </a>
      )}
    </div>
  );
}

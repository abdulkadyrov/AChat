import { useState } from "react";
import { Download, RotateCcw, X } from "lucide-react";
import type { Message } from "@/shared/types/domain";

export function ImageMessageBubble({ message }: { message: Message }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  if (!message.mediaDataUrl || failed) {
    return (
      <div className="flex aspect-[4/3] w-[min(280px,70vw)] flex-col items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-secondary)] text-[13px] text-[var(--color-text-secondary)]">
        <span>Не удалось загрузить фото</span>
        {message.mediaDataUrl && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setFailed(false);
              setRetryKey((key) => key + 1);
            }}
          >
            <RotateCcw aria-hidden="true" size={16} />
            Повторить
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="relative block aspect-[4/3] w-[min(320px,70vw)] max-w-full overflow-hidden rounded-xl"
        onClick={() => setViewerOpen(true)}
        aria-label="Открыть фотографию"
      >
        {!loaded && (
          <span className="absolute inset-0 animate-pulse bg-[var(--color-surface-secondary)]" />
        )}
        <img
          key={retryKey}
          src={message.mediaDataUrl}
          alt={message.preview || "Фотография в чате"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="block h-full w-full object-cover"
        />
      </button>
      {message.preview && message.preview !== "Фото" && (
        <p className="mt-2 text-[14px]">{message.preview}</p>
      )}
      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографии"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewerOpen(false)}
        >
          <img
            src={message.mediaDataUrl}
            alt={message.preview || "Фотография в чате"}
            className="max-h-[90dvh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            className="icon-button absolute right-4 top-4 bg-black/40 text-white"
            onClick={() => setViewerOpen(false)}
            aria-label="Закрыть просмотр"
          >
            <X aria-hidden="true" size={24} />
          </button>
          <a
            className="secondary-button absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black"
            href={message.mediaDataUrl}
            download="achat-photo"
            onClick={(event) => event.stopPropagation()}
          >
            <Download aria-hidden="true" size={18} />
            Сохранить
          </a>
        </div>
      )}
    </>
  );
}

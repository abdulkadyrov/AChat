import { useEffect, useRef, useState } from "react";
import { Camera, Mic, Paperclip, Send, Smile, Square, X } from "lucide-react";
import { AttachmentSheet } from "@/features/messages/ui/attachment-sheet";
import { useSendMediaMessage, useSendMessage } from "@/features/messages/model/use-send-message";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { IconButton } from "@/shared/ui/icon-button";

interface MessageInputProps {
  chatId: string;
  replyPreview?: string | null;
  ttlLabel?: string | null;
  onSent?: () => void;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

export function MessageInput({ chatId, replyPreview, ttlLabel, onSent }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ file: File; dataUrl: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voicePreview, setVoicePreview] = useState<{ dataUrl: string; durationSec: number } | null>(
    null
  );
  const [recordingError, setRecordingError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const sendingState = useMessageStore((state: MessageState) => state.sendingState);
  const replyTo = useUiStore((state: UiState) => state.replyTo);
  const setReplyTo = useUiStore((state: UiState) => state.setReplyTo);
  const showToast = useUiStore((state: UiState) => state.showToast);
  const sendMessage = useSendMessage();
  const sendMediaMessage = useSendMediaMessage();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "40px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [value]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    },
    []
  );

  async function handleSubmit() {
    const content = value.trim();
    if (!content || sendMessage.isPending) return;
    try {
      await sendMessage.mutateAsync({ chatId, content });
      setValue("");
      onSent?.();
    } catch {
      showToast("Не удалось отправить. Черновик сохранён");
    }
  }

  async function pickImage(file: File | null) {
    if (!file) return;
    try {
      setImagePreview({ file, dataUrl: await fileToDataUrl(file) });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Не удалось открыть фото");
    }
  }

  async function sendImage() {
    if (!imagePreview) return;
    await sendMediaMessage.mutateAsync({
      chatId,
      type: "image",
      dataUrl: imagePreview.dataUrl,
      preview: imagePreview.file.name || "Фото"
    });
    setImagePreview(null);
    onSent?.();
  }

  async function sendFile(file: File | null) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast("Файл больше 20 МБ");
      return;
    }
    await sendMediaMessage.mutateAsync({
      chatId,
      type: "file",
      dataUrl: await fileToDataUrl(file),
      preview: file.name,
      fileName: file.name,
      fileSize: file.size
    });
    onSent?.();
  }

  async function startRecording() {
    setRecordingError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      startedAtRef.current = performance.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const durationSec = (performance.now() - startedAtRef.current) / 1000;
        stream.getTracks().forEach((track) => track.stop());
        if (durationSec < 0.5) {
          showToast("Удерживайте запись не меньше 0,5 секунды");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setVoicePreview({
          dataUrl: await fileToDataUrl(new File([blob], "voice.webm", { type: blob.type })),
          durationSec
        });
      };
      recorder.start();
      setRecordingSeconds(0);
      setRecording(true);
      timerRef.current = window.setInterval(
        () => setRecordingSeconds(Math.floor((performance.now() - startedAtRef.current) / 1000)),
        250
      );
    } catch {
      setRecordingError("Разрешите доступ к микрофону в настройках браузера");
    }
  }

  function stopRecording(cancel = false) {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    if (cancel) {
      recorder.onstop = () => recorder.stream.getTracks().forEach((track) => track.stop());
      chunksRef.current = [];
    }
    recorder.stop();
    setRecording(false);
  }

  async function sendVoice() {
    if (!voicePreview) return;
    await sendMediaMessage.mutateAsync({
      chatId,
      type: "voice",
      dataUrl: voicePreview.dataUrl,
      preview: "Голосовое сообщение",
      durationSec: Math.ceil(voicePreview.durationSec)
    });
    setVoicePreview(null);
    onSent?.();
  }

  return (
    <div className="shrink-0 border-t border-[var(--color-divider)] bg-[var(--color-surface)] px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {ttlLabel && (
        <p className="mb-1.5 text-center text-[11px] text-[var(--color-text-secondary)]">
          {ttlLabel}
        </p>
      )}
      {replyTo && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border-l-[3px] border-[var(--color-accent)] bg-[var(--color-surface-secondary)] px-3 py-2">
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-semibold text-[var(--color-accent)]">
              Ответ на сообщение
            </span>
            <span className="block truncate text-[12px] text-[var(--color-text-secondary)]">
              {replyPreview ?? "Сообщение"}
            </span>
          </span>
          <IconButton
            onClick={() => setReplyTo(null)}
            aria-label="Отменить ответ"
            className="h-9 w-9"
          >
            <X aria-hidden="true" size={17} />
          </IconButton>
        </div>
      )}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-[var(--color-surface-secondary)] p-2">
          <img
            src={imagePreview.dataUrl}
            alt="Предпросмотр фотографии"
            className="h-14 w-14 rounded-lg object-cover"
          />
          <span className="min-w-0 flex-1 truncate text-[13px]">{imagePreview.file.name}</span>
          <IconButton
            onClick={() => setImagePreview(null)}
            aria-label="Убрать фото"
            className="h-9 w-9"
          >
            <X aria-hidden="true" size={17} />
          </IconButton>
          <button type="button" className="primary-button h-10 min-h-10 px-3" onClick={sendImage}>
            Отправить
          </button>
        </div>
      )}
      {voicePreview && (
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-[var(--color-surface-secondary)] p-2">
          <audio controls src={voicePreview.dataUrl} className="h-10 min-w-0 flex-1" />
          <IconButton
            onClick={() => setVoicePreview(null)}
            aria-label="Удалить запись"
            className="h-9 w-9"
          >
            <X aria-hidden="true" size={17} />
          </IconButton>
          <button type="button" className="primary-button h-10 min-h-10 px-3" onClick={sendVoice}>
            Отправить
          </button>
        </div>
      )}
      {recordingError && (
        <p role="alert" className="mb-2 text-[12px] text-[var(--color-danger)]">
          {recordingError}
        </p>
      )}
      <div className="flex min-h-12 items-end gap-1.5">
        <IconButton onClick={() => setAttachmentsOpen(true)} aria-label="Добавить вложение">
          <Paperclip aria-hidden="true" size={21} />
        </IconButton>
        <div className="flex min-h-11 min-w-0 flex-1 items-end rounded-[14px] bg-[var(--color-surface-secondary)] pl-3">
          {recording ? (
            <div className="flex min-h-11 flex-1 items-center gap-2 text-[13px] text-[var(--color-danger)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-danger)]" />
              Запись 0:{String(recordingSeconds).padStart(2, "0")}
              <button
                type="button"
                className="ml-auto min-h-11 px-3 font-semibold"
                onClick={() => stopRecording(true)}
              >
                Отмена
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              rows={1}
              aria-label="Сообщение"
              placeholder="Напишите сообщение…"
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  navigator.maxTouchPoints === 0 &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              className="max-h-[120px] min-h-10 min-w-0 flex-1 resize-none bg-transparent py-2.5 outline-none placeholder:text-[var(--color-text-muted)]"
            />
          )}
          {!recording && (
            <IconButton
              onClick={() => setValue((current) => `${current}🙂`)}
              aria-label="Добавить эмодзи"
              className="h-11 w-11"
            >
              <Smile aria-hidden="true" size={20} />
            </IconButton>
          )}
          {!recording && (
            <IconButton
              onClick={() => cameraInputRef.current?.click()}
              aria-label="Сделать фото"
              className="h-11 w-11"
            >
              <Camera aria-hidden="true" size={20} />
            </IconButton>
          )}
        </div>
        <button
          type="button"
          className="icon-button h-12 w-12 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
          aria-label={
            value.trim()
              ? "Отправить сообщение"
              : recording
                ? "Остановить запись"
                : "Записать голосовое сообщение"
          }
          onClick={() =>
            value.trim() ? handleSubmit() : recording ? stopRecording() : startRecording()
          }
        >
          {value.trim() ? (
            <Send aria-hidden="true" size={21} />
          ) : recording ? (
            <Square aria-hidden="true" size={18} className="fill-current" />
          ) : (
            <Mic aria-hidden="true" size={22} />
          )}
        </button>
      </div>
      {sendingState === "error" && (
        <p role="alert" className="mt-1 text-right text-[11px] text-[var(--color-danger)]">
          Ошибка отправки — текст сохранён
        </p>
      )}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => sendFile(event.target.files?.[0] ?? null)}
      />
      <AttachmentSheet
        open={attachmentsOpen}
        onClose={() => setAttachmentsOpen(false)}
        onSelect={(kind) => {
          setAttachmentsOpen(false);
          if (kind === "gallery") galleryInputRef.current?.click();
          if (kind === "camera") cameraInputRef.current?.click();
          if (kind === "file") fileInputRef.current?.click();
          if (kind === "voice") startRecording();
        }}
      />
    </div>
  );
}

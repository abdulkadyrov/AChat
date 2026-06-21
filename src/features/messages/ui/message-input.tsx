import { useRef, useState } from "react";
import { Camera, Mic, Plus, Send, Smile, Square, X } from "lucide-react";
import { useSendMediaMessage, useSendMessage } from "@/features/messages/model/use-send-message";
import { IconButton } from "@/shared/ui/icon-button";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";

interface MessageInputProps {
  chatId: string;
  replyPreview?: string | null;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MessageInput({ chatId, replyPreview }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [isRecording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sendingState = useMessageStore((state: MessageState) => state.sendingState);
  const replyTo = useUiStore((state: UiState) => state.replyTo);
  const setReplyTo = useUiStore((state: UiState) => state.setReplyTo);
  const sendMessage = useSendMessage();
  const sendMediaMessage = useSendMediaMessage();

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await sendMessage.mutateAsync({ chatId, content: value.trim() });
    setValue("");
  };

  async function handleImagePick(file: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    await sendMediaMessage.mutateAsync({
      chatId,
      type: "image",
      dataUrl,
      preview: file.name || "Фото"
    });
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
      const dataUrl = await fileToDataUrl(file);
      await sendMediaMessage.mutateAsync({
        chatId,
        type: "voice",
        dataUrl,
        preview: "Голосовое сообщение"
      });
      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    setRecording(true);
  }

  return (
    <div className="glass-panel fixed bottom-[5.25rem] left-1/2 z-30 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[22px] p-2 sm:bottom-[6.25rem]">
      {replyTo && (
        <div className="mb-2 flex items-start justify-between gap-3 rounded-2xl bg-slate-100 px-3 py-2 text-sm dark:bg-white/5">
          <div>
            <p className="font-semibold">Ответ на сообщение</p>
            <p className="text-ink-soft dark:text-slate-400">{replyPreview ?? "..."}</p>
          </div>
          <button type="button" onClick={() => setReplyTo(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <IconButton
          className="h-11 w-11 border-none bg-transparent shadow-none"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="h-5 w-5" />
        </IconButton>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Сообщение"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-soft dark:placeholder:text-slate-500"
        />
        <IconButton className="h-11 w-11 border-none bg-transparent shadow-none">
          <Smile className="h-5 w-5" />
        </IconButton>
        <IconButton
          className="h-11 w-11 border-none bg-transparent shadow-none"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-5 w-5" />
        </IconButton>
        <button
          type="button"
          onClick={value.trim() ? handleSubmit : toggleRecording}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-emerald-900/15 transition hover:scale-[1.02]"
        >
          {value.trim() ? (
            <Send className="h-5 w-5" />
          ) : isRecording ? (
            <Square className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
        {sendingState === "error" && (
          <span className="absolute -top-8 right-2 rounded-full bg-rose-500 px-2 py-1 text-[11px] text-white">
            Retry
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleImagePick(event.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Camera, Mic, Plus, Send, Smile } from "lucide-react";
import { useSendMessage } from "@/features/messages/model/use-send-message";
import { IconButton } from "@/shared/ui/icon-button";
import { useMessageStore } from "@/shared/model/message-store";

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const [value, setValue] = useState("");
  const sendingState = useMessageStore((state) => state.sendingState);
  const sendMessage = useSendMessage();

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await sendMessage.mutateAsync({ chatId, content: value.trim() });
    setValue("");
  };

  return (
    <div className="glass-panel fixed bottom-[5.25rem] left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-2 rounded-[22px] p-2 sm:bottom-[6.25rem]">
      <IconButton className="h-11 w-11 border-none bg-transparent shadow-none">
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
      <IconButton className="h-11 w-11 border-none bg-transparent shadow-none">
        <Camera className="h-5 w-5" />
      </IconButton>
      <button
        onClick={value.trim() ? handleSubmit : undefined}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-emerald-900/15 transition hover:scale-[1.02]"
      >
        {value.trim() ? <Send className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      {sendingState === "error" && (
        <span className="absolute -top-8 right-2 rounded-full bg-rose-500 px-2 py-1 text-[11px] text-white">
          Retry
        </span>
      )}
    </div>
  );
}

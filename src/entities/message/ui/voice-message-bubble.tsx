import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Message } from "@/shared/types/domain";

let activeAudio: HTMLAudioElement | null = null;

function formatDuration(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function VoiceMessageBubble({ message }: { message: Message }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(message.durationSec ?? 0);
  const [rate, setRate] = useState(1);
  const bars = useMemo(() => Array.from({ length: 28 }, (_, index) => 7 + ((index * 11) % 18)), []);
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  useEffect(() => {
    if (!message.mediaDataUrl) return;
    const audio = new Audio(message.mediaDataUrl);
    audio.preload = "metadata";
    audioRef.current = audio;
    const handleMetadata = () => setDuration(message.durationSec ?? audio.duration ?? 0);
    const handleTime = () => setCurrentTime(audio.currentTime);
    const handlePause = () => setPlaying(false);
    const handlePlay = () => setPlaying(true);
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [message.durationSec, message.mediaDataUrl]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    if (activeAudio && activeAudio !== audio) activeAudio.pause();
    activeAudio = audio;
    await audio.play().catch(() => setPlaying(false));
  }

  function cycleRate() {
    const nextRate = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  }

  return (
    <div className="flex min-w-[232px] max-w-[280px] items-center gap-3">
      <button
        type="button"
        onClick={togglePlay}
        disabled={!message.mediaDataUrl}
        aria-label={playing ? "Пауза" : "Воспроизвести голосовое сообщение"}
        className="icon-button h-11 w-11 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        {playing ? (
          <Pause aria-hidden="true" size={20} />
        ) : (
          <Play aria-hidden="true" size={20} className="ml-0.5 fill-current" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-7 items-center gap-[2px]" aria-hidden="true">
          {bars.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={`w-[2px] rounded-full ${index / bars.length <= progress ? "bg-[var(--color-accent)]" : "bg-[var(--color-text-muted)] opacity-70"}`}
              style={{ height }}
            />
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
          <span>{formatDuration(playing ? currentTime : duration)}</span>
          <button
            type="button"
            onClick={cycleRate}
            className="min-h-7 rounded-lg px-2 font-semibold"
            aria-label="Изменить скорость воспроизведения"
          >
            {rate}×
          </button>
        </div>
      </div>
    </div>
  );
}

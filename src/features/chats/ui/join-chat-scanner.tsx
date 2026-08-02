import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, ScanLine } from "lucide-react";
import QrScanner from "qr-scanner";
import { useNavigate } from "react-router-dom";
import { scanQrFromImage } from "@/shared/lib/qr/scan-qr";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { Sheet } from "@/shared/ui/sheet";
import type { UserProfile } from "@/shared/types/domain";

interface JoinChatScannerProps {
  open: boolean;
  onClose: () => void;
  onJoined?: () => void;
}

export function JoinChatScanner({ open, onClose, onJoined }: JoinChatScannerProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state: AuthState) => state.user);
  const joinByInviteToken = useChatStore((state: ChatState) => state.joinByInviteToken);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const processingRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isJoining, setJoining] = useState(false);
  const [error, setError] = useState("");

  function stopCamera() {
    scannerRef.current?.destroy();
    scannerRef.current = null;
    setCameraActive(false);
  }

  useEffect(() => {
    if (!open) stopCamera();
    return () => scannerRef.current?.destroy();
  }, [open]);

  if (!user) return null;
  const currentUser: UserProfile = user;

  async function joinFromQr(rawValue: string) {
    if (processingRef.current) return;
    processingRef.current = true;
    setJoining(true);
    setError("");

    try {
      const joined = await joinByInviteToken({ token: rawValue, user: currentUser });

      if (!joined.ok) {
        setError(joined.reason);
        return;
      }

      stopCamera();
      onClose();
      onJoined?.();
      navigate(`/chat/${joined.chatId}`);
    } catch {
      setError("Это не QR-приглашение AChat. Попробуйте другой код.");
    } finally {
      setJoining(false);
      processingRef.current = false;
    }
  }

  async function startCamera() {
    if (!videoRef.current || scannerRef.current) return;
    setError("");

    try {
      const scanner = new QrScanner(videoRef.current, (result) => void joinFromQr(result.data), {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: "environment"
      });
      scannerRef.current = scanner;
      await scanner.start();
      setCameraActive(true);
    } catch {
      stopCamera();
      setError("Камера недоступна. Разрешите доступ или выберите фото с QR-кодом.");
    }
  }

  function close() {
    stopCamera();
    setError("");
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Сканировать QR-код"
      description="Наведите камеру на QR-приглашение — номер участника вводить не нужно."
    >
      <div className="relative mt-4 aspect-square overflow-hidden rounded-[24px] bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"}`}
        />
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-surface-secondary)] p-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <ScanLine aria-hidden="true" size={34} />
            </span>
            <p className="text-sm text-[var(--color-text-secondary)]">
              QR-код автоматически откроет нужный чат.
            </p>
          </div>
        )}
        {cameraActive && (
          <div className="pointer-events-none absolute inset-[16%] rounded-3xl border-2 border-[var(--color-accent)] shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="primary-button"
          onClick={cameraActive ? stopCamera : startCamera}
          disabled={isJoining}
        >
          <Camera aria-hidden="true" size={18} />
          {cameraActive ? "Стоп" : "Камера"}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => fileRef.current?.click()}
          disabled={isJoining}
        >
          <ImagePlus aria-hidden="true" size={18} /> Фото QR
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setJoining(true);
          setError("");
          try {
            const result = await scanQrFromImage(file);
            await joinFromQr(result.data);
          } catch {
            setError("QR-код на фото не найден. Попробуйте другое изображение.");
          } finally {
            setJoining(false);
          }
        }}
      />
      <button type="button" className="secondary-button mt-3 w-full" onClick={close}>
        Закрыть
      </button>
    </Sheet>
  );
}

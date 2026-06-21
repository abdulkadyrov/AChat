import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/model/auth-store";
import { useChatStore } from "@/shared/model/chat-store";
import { createQrScanner, scanQrFromImage } from "@/shared/lib/qr/scan-qr";

interface JoinChatScannerProps {
  open: boolean;
  onClose: () => void;
}

export function JoinChatScanner({ open, onClose }: JoinChatScannerProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerRef = useRef<{ stop: () => void; destroy: () => void } | null>(null);
  const user = useAuthStore((state) => state.user);
  const joinByInviteToken = useChatStore((state) => state.joinByInviteToken);
  const userRef = useRef(user);
  const joinRef = useRef(joinByInviteToken);
  const [error, setError] = useState("");
  const [isCameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    userRef.current = user;
    joinRef.current = joinByInviteToken;
  }, [joinByInviteToken, user]);

  useEffect(() => {
    if (!open || !videoRef.current || !userRef.current || scannerRef.current) return;

    let mounted = true;
    setError("");
    setCameraReady(false);

    createQrScanner(
      videoRef.current,
      (result) => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        const token = typeof result === "string" ? result : result.data;
        joinRef.current({ token, user: currentUser }).then((joined) => {
          if (joined.ok) {
            handleClose();
            navigate(`/chat/${joined.chatId}`);
          } else {
            setError(joined.reason);
          }
        });
      },
      (scanError) => {
        const message = scanError instanceof Error ? scanError.message : String(scanError);
        if (!/No QR code found/i.test(message)) {
          setError(`Ошибка сканера: ${message}`);
        }
      }
    )
      .then((scanner) => {
        if (!mounted) {
          scanner.destroy();
          return;
        }
        scannerRef.current = scanner;
        return scanner.start().then(() => {
          if (mounted) setCameraReady(true);
        });
      })
      .catch((scanError) => {
        if (!mounted) return;
        const message = scanError instanceof Error ? scanError.message : String(scanError);
        setError(
          message
            ? `Не удалось включить камеру: ${message}`
            : "Не удалось включить камеру. Проверьте разрешение браузера."
        );
      });

    return () => {
      mounted = false;
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
      setCameraReady(false);
    };
  }, [open, navigate]);

  if (!open || !user) return null;

  function handleClose() {
    scannerRef.current?.stop();
    onClose();
  }

  async function handleGalleryPick(file: File | null) {
    const currentUser = userRef.current;
    if (!file || !currentUser) return;
    try {
      const result = await scanQrFromImage(file);
      const joined = await joinRef.current({ token: result.data, user: currentUser });
      if (joined.ok) {
        handleClose();
        navigate(`/chat/${joined.chatId}`);
      } else {
        setError(joined.reason);
      }
    } catch {
      setError("Не удалось распознать QR-код из изображения.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 p-4 text-white">
      <div className="mx-auto flex h-full w-full max-w-xl flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Сканировать QR</h3>
            <p className="text-sm text-slate-300">Наведите камеру на QR-код или выберите изображение из галереи.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold"
          >
            Закрыть
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-60 w-60 rounded-[32px] border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.32)]" />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-semibold"
          >
            <ImagePlus className="h-5 w-5" />
            Из галереи
          </button>
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300">
            <Camera className="mr-2 h-5 w-5" />
            {isCameraReady ? "Камера включена" : "Подключаем камеру"}
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleGalleryPick(event.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

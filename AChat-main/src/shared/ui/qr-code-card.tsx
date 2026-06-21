import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeCardProps {
  value: string;
  title?: string;
}

export function QrCodeCard({ value, title }: QrCodeCardProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      width: 280,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#ffffff"
      }
    }).then((dataUrl: string) => {
      if (active) setSrc(dataUrl);
    });

    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className="text-center">
      {title && <p className="mb-3 text-sm font-semibold">{title}</p>}
      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-[24px] border border-slate-200 bg-white p-3 dark:border-white/10">
        {src ? <img src={src} alt="QR code" className="h-56 w-56" /> : <div className="h-56 w-56 animate-pulse rounded-2xl bg-slate-100" />}
      </div>
    </div>
  );
}

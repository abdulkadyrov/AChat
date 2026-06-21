export async function createQrScanner(
  video: HTMLVideoElement,
  onDecode: (result: { data: string } | string) => void,
  onDecodeError?: (error: unknown) => void
) {
  const [{ default: QrScanner }, workerModule] = await Promise.all([
    import("qr-scanner"),
    import("qr-scanner/qr-scanner-worker.min.js?url")
  ]);

  QrScanner.WORKER_PATH = workerModule.default;

  return new QrScanner(video, onDecode, {
    highlightScanRegion: true,
    highlightCodeOutline: true,
    maxScansPerSecond: 5,
    onDecodeError
  });
}

export async function scanQrFromImage(file: File) {
  const [{ default: QrScanner }, workerModule] = await Promise.all([
    import("qr-scanner"),
    import("qr-scanner/qr-scanner-worker.min.js?url")
  ]);

  QrScanner.WORKER_PATH = workerModule.default;

  return QrScanner.scanImage(file, { returnDetailedScanResult: true });
}

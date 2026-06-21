import QrScanner from "qr-scanner";

QrScanner.WORKER_PATH = new URL(
  "qr-scanner/qr-scanner-worker.min.js",
  import.meta.url
).toString();

export async function scanQrFromImage(file: File) {
  return QrScanner.scanImage(file, { returnDetailedScanResult: true });
}

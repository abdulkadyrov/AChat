import QrScanner from "qr-scanner";
import qrWorkerPath from "qr-scanner/qr-scanner-worker.min.js?url";

QrScanner.WORKER_PATH = qrWorkerPath;

export async function scanQrFromImage(file: File) {
  return QrScanner.scanImage(file, { returnDetailedScanResult: true });
}

import QrScanner from "qr-scanner";

QrScanner.WORKER_PATH = new URL(
  "qr-scanner/qr-scanner-worker.min.js",
  import.meta.url
).toString();

async function loadImageFromBlob(blob: Blob) {
  const imageUrl = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.decoding = "async";

    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image load error"));
      image.src = imageUrl;
    });

    return loaded;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function scanQrFromImage(file: File) {
  try {
    return await QrScanner.scanImage(file, {
      returnDetailedScanResult: true,
      alsoTryWithoutScanRegion: true
    });
  } catch (error) {
    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        return await QrScanner.scanImage(bitmap, {
          returnDetailedScanResult: true,
          alsoTryWithoutScanRegion: true
        });
      } catch {
        // Fall through to HTMLImageElement loading for browsers that fail to decode directly from File/Bitmap.
      }
    }

    try {
      const image = await loadImageFromBlob(file);
      return await QrScanner.scanImage(image, {
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true
      });
    } catch {
      throw error;
    }
  }
}

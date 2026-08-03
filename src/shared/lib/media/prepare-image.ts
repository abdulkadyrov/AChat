const maxImageSide = 1_280;
const targetImageBytes = 320 * 1024;

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать фото"));
    reader.readAsDataURL(blob);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Не удалось открыть фото"));
    image.src = dataUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось подготовить фото"))),
      "image/webp",
      quality
    );
  });
}

export async function prepareImageDataUrl(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Выбранный файл не является фото");
  if (file.size > 20 * 1024 * 1024) throw new Error("Фото больше 20 МБ");

  const originalDataUrl = await blobToDataUrl(file);
  if (file.size <= targetImageBytes) return originalDataUrl;

  const image = await loadImage(originalDataUrl);
  let scale = Math.min(1, maxImageSide / Math.max(image.naturalWidth, image.naturalHeight));
  let result: Blob | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Обработка фото не поддерживается браузером");

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    result = await canvasToBlob(canvas, Math.max(0.62, 0.84 - attempt * 0.06));
    if (result.size <= targetImageBytes) break;
    scale *= 0.8;
  }

  if (!result) throw new Error("Не удалось подготовить фото");
  return blobToDataUrl(result);
}

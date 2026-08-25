import type { EditorAdjustments } from '../types';

export const PRINT_DPI = 300;

/** Converte milímetros para pixels a uma resolução de impressão dada. */
export function mmToPx(mm: number, dpi: number = PRINT_DPI): number {
  return Math.round((mm / 25.4) * dpi);
}

export function pxToMm(px: number, dpi: number = PRINT_DPI): number {
  return (px / dpi) * 25.4;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compõe a fotografia (com fundo transparente, resultado da remoção de fundo)
 * sobre uma cor sólida, devolvendo um novo dataURL. Não perde resolução.
 */
export async function composeOnBackground(
  transparentDataUrl: string,
  backgroundColor: string
): Promise<string> {
  const img = await loadImage(transparentDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Gera o recorte final: aplica zoom/deslocamento definidos pelo utilizador
 * sobre a imagem de origem e exporta exatamente na proporção do tamanho de
 * documento escolhido, à resolução de impressão (300 DPI), sem esticar.
 */
export async function renderFinalCrop(
  sourceDataUrl: string,
  targetWidthMm: number,
  targetHeightMm: number,
  adjustments: EditorAdjustments
): Promise<string> {
  const img = await loadImage(sourceDataUrl);

  const outW = mmToPx(targetWidthMm);
  const outH = mmToPx(targetHeightMm);
  const targetRatio = outW / outH;
  const srcRatio = img.naturalWidth / img.naturalHeight;

  // Recorte base: maior retângulo com a proporção alvo que cabe na imagem
  // (contain-then-cover), preservando a proporção — nunca esticar.
  let baseW: number;
  let baseH: number;
  if (srcRatio > targetRatio) {
    baseH = img.naturalHeight;
    baseW = baseH * targetRatio;
  } else {
    baseW = img.naturalWidth;
    baseH = baseW / targetRatio;
  }

  // Aplicar zoom (>1 aproxima, reduzindo a área de origem visível)
  const zoom = Math.max(0.5, Math.min(3, adjustments.zoom || 1));
  const cropW = baseW / zoom;
  const cropH = baseH / zoom;

  // Centro + deslocamento do utilizador (offset em px de ecrã convertido
  // proporcionalmente ao espaço de origem)
  const centerX = img.naturalWidth / 2 - (adjustments.offsetX || 0);
  const centerY = img.naturalHeight / 2 - (adjustments.offsetY || 0);

  let sx = centerX - cropW / 2;
  let sy = centerY - cropH / 2;

  // Nunca sair dos limites da imagem original
  sx = Math.max(0, Math.min(img.naturalWidth - cropW, sx));
  sy = Math.max(0, Math.min(img.naturalHeight - cropH, sy));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.filter = buildCssFilter(adjustments);
  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outW, outH);

  if (adjustments.sharpness > 0) {
    applySharpen(ctx, outW, outH, adjustments.sharpness / 100);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}

export function buildCssFilter(a: EditorAdjustments): string {
  const brightness = 1 + a.brightness / 100;
  const contrast = 1 + a.contrast / 100;
  const saturate = 1 + a.saturation / 100;
  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
}

/** Nitidez leve via convolução (unsharp mask simplificada). */
function applySharpen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number
) {
  const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const side = 3;
  const half = 1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstOff = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        let acc = 0;
        for (let ky = 0; ky < side; ky++) {
          for (let kx = 0; kx < side; kx++) {
            const sy = Math.min(h - 1, Math.max(0, y + ky - half));
            const sx = Math.min(w - 1, Math.max(0, x + kx - half));
            const srcOff = (sy * w + sx) * 4;
            acc += src.data[srcOff + ch] * weights[ky * side + kx];
          }
        }
        const original = src.data[dstOff + ch];
        dst.data[dstOff + ch] = original + (acc - original) * amount;
      }
      dst.data[dstOff + 3] = src.data[dstOff + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
}

export interface ResolutionCheck {
  sufficient: boolean;
  requiredPx: { width: number; height: number };
  actualPx: { width: number; height: number };
}

/** Verifica se a fotografia original tem pixels suficientes para 300 DPI. */
export function checkResolution(
  actualWidthPx: number,
  actualHeightPx: number,
  targetWidthMm: number,
  targetHeightMm: number
): ResolutionCheck {
  const requiredPx = {
    width: mmToPx(targetWidthMm),
    height: mmToPx(targetHeightMm),
  };
  return {
    sufficient:
      actualWidthPx >= requiredPx.width && actualHeightPx >= requiredPx.height,
    requiredPx,
    actualPx: { width: actualWidthPx, height: actualHeightPx },
  };
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export type WizardStep =
  | 'home'
  | 'upload'
  | 'background'
  | 'adjust'
  | 'size'
  | 'print'
  | 'preview'
  | 'result';

export type BackgroundRemovalStatus = 'idle' | 'processing' | 'done' | 'error';

export interface BackgroundOption {
  id: string;
  label: string;
  color: string; // CSS color usado para compor o fundo
}

export interface PhotoSizeMm {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
}

export type PrintFormatId = 'single' | 'sheet6' | 'a4' | 'a5';

export interface PaperSizeMm {
  widthMm: number;
  heightMm: number;
}

export interface LayoutInput {
  paperWidthMm: number;
  paperHeightMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
  marginMm: number;
  spacingMm: number;
}

export interface LayoutCell {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface LayoutResult {
  columns: number;
  rows: number;
  total: number;
  orientation: 'portrait' | 'landscape';
  paperWidthMm: number;
  paperHeightMm: number;
  cells: LayoutCell[];
}

export interface EditorAdjustments {
  zoom: number; // 1 = ajuste base
  offsetX: number; // px, relativo ao canvas de recorte
  offsetY: number;
  brightness: number; // -100..100
  contrast: number; // -100..100
  saturation: number; // -100..100
  sharpness: number; // 0..100 (aplicado via convolução leve)
}

export const DEFAULT_ADJUSTMENTS: EditorAdjustments = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
};

export interface ProjectState {
  originalImage: HTMLImageElement | null;
  originalFileName: string;
  originalWidthPx: number;
  originalHeightPx: number;
  bgRemovedDataUrl: string | null;
  bgRemovalStatus: BackgroundRemovalStatus;
  bgRemovalError: string | null;
  selectedBackground: BackgroundOption | null;
  composedDataUrl: string | null; // foto com fundo aplicado, antes do recorte
  adjustments: EditorAdjustments;
  selectedSize: PhotoSizeMm | null;
  printFormat: PrintFormatId | null;
  finalCropDataUrl: string | null; // exatamente a foto final, já no aspect ratio do tamanho escolhido
}

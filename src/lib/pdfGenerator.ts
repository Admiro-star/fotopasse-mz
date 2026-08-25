import { jsPDF } from 'jspdf';
import { calculatePhotoLayout } from './layoutCalculator';
import type { LayoutResult, PrintFormatId } from '../types';

export interface PdfBuildOptions {
  photoDataUrl: string; // JPEG/PNG já recortado exatamente no tamanho do documento
  photoWidthMm: number;
  photoHeightMm: number;
  printFormat: PrintFormatId;
  marginMm?: number;
  spacingMm?: number;
}

const A4: [number, number] = [210, 297];
const A5: [number, number] = [148, 210];

/**
 * Gera um PDF real, com o tamanho físico de página correto (A4/A5) ou uma
 * página exatamente do tamanho da fotografia (opção individual), imagens
 * posicionadas em milímetros — não é uma captura de ecrã.
 */
export function buildPrintPdf(opts: PdfBuildOptions): { pdf: jsPDF; layout: LayoutResult | null } {
  const { photoDataUrl, photoWidthMm, photoHeightMm, printFormat } = opts;
  const marginMm = opts.marginMm ?? 5;
  const spacingMm = opts.spacingMm ?? 3;

  if (printFormat === 'single') {
    const pdf = new jsPDF({
      orientation: photoWidthMm >= photoHeightMm ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [photoWidthMm, photoHeightMm],
    });
    pdf.addImage(photoDataUrl, 'JPEG', 0, 0, photoWidthMm, photoHeightMm, undefined, 'FAST');
    return { pdf, layout: null };
  }

  let paperWidthMm: number;
  let paperHeightMm: number;
  let sheetMargin = marginMm;

  if (printFormat === 'sheet6') {
    // Folha pensada para conter exatamente 6 fotografias, com o mínimo de
    // desperdício, mas ainda respeitando o tamanho físico A4 (mais comum
    // nas fotocopiadoras/estúdios em Moçambique).
    [paperWidthMm, paperHeightMm] = A4;
  } else if (printFormat === 'a4') {
    [paperWidthMm, paperHeightMm] = A4;
  } else {
    [paperWidthMm, paperHeightMm] = A5;
  }

  let layout = calculatePhotoLayout({
    paperWidthMm,
    paperHeightMm,
    photoWidthMm,
    photoHeightMm,
    marginMm: sheetMargin,
    spacingMm,
  });

  if (printFormat === 'sheet6' && layout.total > 6) {
    // Manter exatamente 6: recalcular a grelha centrada usando só 6 células
    layout = limitLayoutTo(layout, 6, photoWidthMm, photoHeightMm, spacingMm);
  }

  const orientation = layout.orientation === 'landscape' ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [layout.paperWidthMm, layout.paperHeightMm],
  });

  for (const cell of layout.cells) {
    pdf.addImage(
      photoDataUrl,
      'JPEG',
      cell.xMm,
      cell.yMm,
      cell.widthMm,
      cell.heightMm,
      undefined,
      'FAST'
    );
  }

  return { pdf, layout };
}

function limitLayoutTo(
  layout: LayoutResult,
  count: number,
  photoWidthMm: number,
  photoHeightMm: number,
  spacingMm: number
): LayoutResult {
  // Deduz uma grelha razoável (ex.: 2x3 ou 3x2) para exatamente `count` fotos
  // e centraliza-a na mesma folha.
  const cols = count <= 3 ? count : Math.ceil(count / 2);
  const rows = Math.ceil(count / cols);

  const gridWidth = cols * photoWidthMm + (cols - 1) * spacingMm;
  const gridHeight = rows * photoHeightMm + (rows - 1) * spacingMm;
  const startX = (layout.paperWidthMm - gridWidth) / 2;
  const startY = (layout.paperHeightMm - gridHeight) / 2;

  const cells = [];
  let placed = 0;
  for (let r = 0; r < rows && placed < count; r++) {
    for (let c = 0; c < cols && placed < count; c++) {
      cells.push({
        xMm: startX + c * (photoWidthMm + spacingMm),
        yMm: startY + r * (photoHeightMm + spacingMm),
        widthMm: photoWidthMm,
        heightMm: photoHeightMm,
      });
      placed++;
    }
  }

  return { ...layout, columns: cols, rows, total: count, cells };
}

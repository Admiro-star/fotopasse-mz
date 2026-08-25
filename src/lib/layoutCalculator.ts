import type { LayoutInput, LayoutResult, LayoutCell } from '../types';

/**
 * calculatePhotoLayout
 *
 * Calcula quantas fotografias de tamanho fixo (mm) cabem numa folha de
 * tamanho fixo (mm), respeitando margens e espaçamento, SEM NUNCA alterar
 * o tamanho físico da fotografia e SEM NUNCA ultrapassar os limites da folha.
 *
 * Testa as duas orientações da folha (retrato/paisagem) e devolve a que
 * maximiza o número de fotografias. Em empate, mantém retrato.
 */
export function calculatePhotoLayout(input: LayoutInput): LayoutResult {
  const portrait = layoutForPaper(
    input.paperWidthMm,
    input.paperHeightMm,
    input
  );
  const landscape = layoutForPaper(
    input.paperHeightMm,
    input.paperWidthMm,
    input
  );

  const best =
    landscape.total > portrait.total
      ? { ...landscape, orientation: 'landscape' as const }
      : { ...portrait, orientation: 'portrait' as const };

  return best;
}

function layoutForPaper(
  paperWidthMm: number,
  paperHeightMm: number,
  input: LayoutInput
): Omit<LayoutResult, 'orientation'> {
  const { photoWidthMm, photoHeightMm, marginMm, spacingMm } = input;

  const usableWidth = paperWidthMm - marginMm * 2;
  const usableHeight = paperHeightMm - marginMm * 2;

  const columns = maxFit(usableWidth, photoWidthMm, spacingMm);
  const rows = maxFit(usableHeight, photoHeightMm, spacingMm);

  const total = Math.max(0, columns) * Math.max(0, rows);

  const gridWidth =
    columns > 0 ? columns * photoWidthMm + (columns - 1) * spacingMm : 0;
  const gridHeight =
    rows > 0 ? rows * photoHeightMm + (rows - 1) * spacingMm : 0;

  // Centralizar a composição na folha
  const startX = (paperWidthMm - gridWidth) / 2;
  const startY = (paperHeightMm - gridHeight) / 2;

  const cells: LayoutCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      cells.push({
        xMm: startX + c * (photoWidthMm + spacingMm),
        yMm: startY + r * (photoHeightMm + spacingMm),
        widthMm: photoWidthMm,
        heightMm: photoHeightMm,
      });
    }
  }

  return { columns, rows, total, paperWidthMm, paperHeightMm, cells };
}

/** Quantas unidades de `size` cabem em `available`, com `gap` entre elas. */
function maxFit(available: number, size: number, gap: number): number {
  if (size <= 0 || available < size) return 0;
  // available >= n*size + (n-1)*gap  =>  n <= (available + gap) / (size + gap)
  return Math.floor((available + gap) / (size + gap));
}

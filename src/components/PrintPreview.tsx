import { useMemo, useState } from 'react';
import { calculatePhotoLayout } from '../lib/layoutCalculator';
import type { LayoutResult, PhotoSizeMm, PrintFormatId } from '../types';

interface Props {
  photoDataUrl: string;
  size: PhotoSizeMm;
  printFormat: PrintFormatId;
}

const PAPERS: Record<'a4' | 'a5', { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  a5: { w: 148, h: 210 },
};

export function PrintPreview({ photoDataUrl, size, printFormat }: Props) {
  const [forceOrientation, setForceOrientation] = useState<'auto' | 'portrait' | 'landscape'>(
    'auto'
  );

  const layout: LayoutResult | null = useMemo(() => {
    if (printFormat === 'single') return null;
    const paper = printFormat === 'sheet6' || printFormat === 'a4' ? PAPERS.a4 : PAPERS.a5;
    const auto = calculatePhotoLayout({
      paperWidthMm: paper.w,
      paperHeightMm: paper.h,
      photoWidthMm: size.widthMm,
      photoHeightMm: size.heightMm,
      marginMm: 5,
      spacingMm: 3,
    });
    if (forceOrientation === 'auto') return auto;

    const wantsLandscape = forceOrientation === 'landscape';
    if ((auto.orientation === 'landscape') === wantsLandscape) return auto;

    // Recalcular forçando a orientação pedida
    const swapped = calculatePhotoLayout({
      paperWidthMm: wantsLandscape ? paper.h : paper.w,
      paperHeightMm: wantsLandscape ? paper.w : paper.h,
      photoWidthMm: size.widthMm,
      photoHeightMm: size.heightMm,
      marginMm: 5,
      spacingMm: 3,
    });
    return { ...swapped, orientation: forceOrientation };
  }, [printFormat, size, forceOrientation]);

  if (printFormat === 'single') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="border border-ink-200 bg-white shadow-card"
          style={{ width: size.widthMm * 3, height: size.heightMm * 3 }}
        >
          <img src={photoDataUrl} alt="Pré-visualização" className="h-full w-full object-cover" />
        </div>
        <p className="text-xs text-ink-500">
          {size.widthMm} × {size.heightMm} mm
        </p>
      </div>
    );
  }

  if (!layout) return null;
  const scale = 1.4; // px por mm no ecrã

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 text-xs">
        {(['auto', 'portrait', 'landscape'] as const).map((o) => (
          <button
            key={o}
            onClick={() => setForceOrientation(o)}
            className={
              'rounded-full px-3 py-1 font-medium ' +
              (forceOrientation === o ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-500')
            }
          >
            {o === 'auto' ? 'Automático' : o === 'portrait' ? 'Vertical' : 'Horizontal'}
          </button>
        ))}
      </div>

      <div
        className="relative border border-ink-200 bg-white shadow-card"
        style={{ width: layout.paperWidthMm * scale, height: layout.paperHeightMm * scale }}
      >
        {layout.cells.map((cell, i) => (
          <img
            key={i}
            src={photoDataUrl}
            alt=""
            className="absolute object-cover"
            style={{
              left: cell.xMm * scale,
              top: cell.yMm * scale,
              width: cell.widthMm * scale,
              height: cell.heightMm * scale,
            }}
          />
        ))}
      </div>

      <p className="text-sm font-medium text-ink-700">
        Esta folha contém {layout.total} fotografia{layout.total === 1 ? '' : 's'}.
      </p>
      <p className="text-xs text-ink-300">
        {layout.paperWidthMm} × {layout.paperHeightMm} mm ·{' '}
        {layout.orientation === 'landscape' ? 'horizontal' : 'vertical'} · {layout.columns} col ×{' '}
        {layout.rows} linhas
      </p>
    </div>
  );
}

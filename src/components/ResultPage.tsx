import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { buildPrintPdf } from '../lib/pdfGenerator';
import { downloadDataUrl } from '../lib/imageUtils';
import type { PhotoSizeMm, PrintFormatId } from '../types';
import { calculatePhotoLayout } from '../lib/layoutCalculator';

interface Props {
  photoDataUrl: string;
  size: PhotoSizeMm;
  printFormat: PrintFormatId;
  onEditAgain: () => void;
  onNewProject: () => void;
}

const PAPERS: Record<'a4' | 'a5', { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  a5: { w: 148, h: 210 },
};

export function ResultPage({ photoDataUrl, size, printFormat, onEditAgain, onNewProject }: Props) {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');

  const quantity =
    printFormat === 'single'
      ? 1
      : printFormat === 'sheet6'
      ? 6
      : (() => {
          const paper = printFormat === 'a4' ? PAPERS.a4 : PAPERS.a5;
          return calculatePhotoLayout({
            paperWidthMm: paper.w,
            paperHeightMm: paper.h,
            photoWidthMm: size.widthMm,
            photoHeightMm: size.heightMm,
            marginMm: 5,
            spacingMm: 3,
          }).total;
        })();

  const paperLabel =
    printFormat === 'single' ? `${size.widthMm}×${size.heightMm} mm` : printFormat === 'sheet6' ? 'A4 (6 fotos)' : printFormat.toUpperCase();

  async function handleDownloadPdf() {
    setStatus('preparing');
    try {
      const { pdf } = buildPrintPdf({
        photoDataUrl,
        photoWidthMm: size.widthMm,
        photoHeightMm: size.heightMm,
        printFormat,
      });
      pdf.save('fotopasse-mz.pdf');
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  function handleDownloadJpg() {
    downloadDataUrl(photoDataUrl, 'fotopasse-mz.jpg');
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <CheckCircle2 className="text-stamp-600" size={40} />
      <h2 className="font-display text-2xl font-semibold text-ink-900">Tudo pronto!</h2>

      <img
        src={photoDataUrl}
        alt="Resultado final"
        className="h-40 w-auto rounded-lg border border-ink-100 shadow-card"
      />

      <div className="card w-full max-w-xs divide-y divide-ink-50 text-left text-sm">
        <Row label="Papel" value={paperLabel} />
        <Row label="Foto" value={`${size.widthMm} × ${size.heightMm} mm`} />
        <Row label="Quantidade" value={`${quantity} foto${quantity === 1 ? '' : 's'}`} />
        <Row label="Qualidade" value="300 DPI" />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <button onClick={handleDownloadPdf} className="btn-primary" disabled={status === 'preparing'}>
          {status === 'preparing' ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Preparando PDF…
            </>
          ) : (
            'Baixar PDF'
          )}
        </button>
        <button onClick={handleDownloadJpg} className="btn-secondary">
          Baixar JPG
        </button>
        <div className="mt-2 flex gap-2">
          <button onClick={onEditAgain} className="btn-ghost flex-1 text-sm">
            Editar novamente
          </button>
          <button onClick={onNewProject} className="btn-ghost flex-1 text-sm">
            Novo projeto
          </button>
        </div>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Não foi possível gerar o PDF. Tente novamente.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-ink-300">{label}</span>
      <span className="font-medium text-ink-700">{value}</span>
    </div>
  );
}

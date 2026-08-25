import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type {
  BackgroundOption,
  BackgroundRemovalStatus,
  EditorAdjustments,
  PhotoSizeMm,
  PrintFormatId,
  WizardStep,
} from './types';
import { DEFAULT_ADJUSTMENTS } from './types';
import { Home } from './components/Home';
import { AboutPage } from './components/AboutPage';
import { UploadPhoto } from './components/UploadPhoto';
import { BackgroundRemover } from './components/BackgroundRemover';
import { BackgroundSelector } from './components/BackgroundSelector';
import { PhotoEditor } from './components/PhotoEditor';
import { PhotoSizeSelector } from './components/PhotoSizeSelector';
import { PrintLayoutSelector } from './components/PrintLayoutSelector';
import { PrintPreview } from './components/PrintPreview';
import { ResultPage } from './components/ResultPage';
import { ProgressBar } from './components/ProgressBar';
import {
  checkResolution,
  composeOnBackground,
  fileToDataUrl,
  loadImage,
  renderFinalCrop,
} from './lib/imageUtils';

export default function App() {
  const [step, setStep] = useState<WizardStep>('home');
  const [showAbout, setShowAbout] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  const [bgStatus, setBgStatus] = useState<BackgroundRemovalStatus>('idle');
  const [bgError, setBgError] = useState<string | null>(null);
  const [transparentDataUrl, setTransparentDataUrl] = useState<string | null>(null);

  const [background, setBackground] = useState<BackgroundOption | null>(null);
  const [composedDataUrl, setComposedDataUrl] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const [adjustments, setAdjustments] = useState<EditorAdjustments>(DEFAULT_ADJUSTMENTS);
  const [size, setSize] = useState<PhotoSizeMm | null>(null);
  const [printFormat, setPrintFormat] = useState<PrintFormatId | null>(null);

  const [finalCropDataUrl, setFinalCropDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [lowResWarning, setLowResWarning] = useState<string | null>(null);

  async function handleFileSelected(selected: File) {
    setFile(selected);
    setBgStatus('idle');
    setBgError(null);
    setTransparentDataUrl(null);
    setBackground(null);
    setComposedDataUrl(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);

    const dataUrl = await fileToDataUrl(selected);
    const img = await loadImage(dataUrl);
    setOriginalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setStep('background');
  }

  async function handleBackgroundSelect(option: BackgroundOption) {
    if (!transparentDataUrl) return;
    setBackground(option);
    setComposing(true);
    try {
      const result = await composeOnBackground(transparentDataUrl, option.color);
      setComposedDataUrl(result);
    } finally {
      setComposing(false);
    }
  }

  function goToAdjust() {
    if (!composedDataUrl) return;
    setStep('adjust');
  }

  function handleSizeSelect(chosen: PhotoSizeMm) {
    setSize(chosen);
    const check = checkResolution(
      originalSize.width,
      originalSize.height,
      chosen.widthMm,
      chosen.heightMm
    );
    setLowResWarning(
      check.sufficient
        ? null
        : 'A fotografia original possui baixa resolução. Para obter melhor qualidade de impressão, recomendamos utilizar uma fotografia com maior resolução.'
    );
  }

  async function goToPrintStep() {
    if (!composedDataUrl || !size) return;
    setRendering(true);
    try {
      const cropped = await renderFinalCrop(composedDataUrl, size.widthMm, size.heightMm, adjustments);
      setFinalCropDataUrl(cropped);
      setStep('print');
    } finally {
      setRendering(false);
    }
  }

  async function goToResult() {
    if (!composedDataUrl || !size || !printFormat) return;
    setRendering(true);
    try {
      const cropped = await renderFinalCrop(composedDataUrl, size.widthMm, size.heightMm, adjustments);
      setFinalCropDataUrl(cropped);
      setStep('result');
    } finally {
      setRendering(false);
    }
  }

  function resetAll() {
    setFile(null);
    setBgStatus('idle');
    setBgError(null);
    setTransparentDataUrl(null);
    setBackground(null);
    setComposedDataUrl(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSize(null);
    setPrintFormat(null);
    setFinalCropDataUrl(null);
    setLowResWarning(null);
    setStep('home');
  }

  if (showAbout) {
    return <AboutPage onBack={() => setShowAbout(false)} />;
  }

  if (step === 'home') {
    return <Home onStart={() => setStep('upload')} onAbout={() => setShowAbout(true)} />;
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-5 py-6 sm:max-w-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep(prevStep(step))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="font-display text-lg font-semibold text-ink-900">FotoPasse MZ</span>
      </div>

      <ProgressBar current={step} />

      {step === 'upload' && <UploadPhoto onSelect={handleFileSelected} />}

      {step === 'background' && file && (
        <div className="flex flex-col gap-5">
          {bgStatus !== 'done' || !transparentDataUrl ? (
            <BackgroundRemover
              file={file}
              status={bgStatus}
              setStatus={setBgStatus}
              error={bgError}
              setError={setBgError}
              onDone={setTransparentDataUrl}
            />
          ) : (
            <>
              <BackgroundSelector selectedId={background?.id ?? null} onSelect={handleBackgroundSelect} />
              {composing && <p className="text-center text-sm text-ink-300">A aplicar fundo…</p>}
              {composedDataUrl && (
                <>
                  <img
                    src={composedDataUrl}
                    alt="Pré-visualização com fundo"
                    className="mx-auto max-h-64 rounded-xl border border-ink-100 shadow-card"
                  />
                  <button onClick={goToAdjust} className="btn-primary">
                    Continuar
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {step === 'adjust' && composedDataUrl && (
        <div className="flex flex-col gap-5">
          <PhotoEditor
            imageSrc={composedDataUrl}
            size={size ?? { id: 'passport-mz', label: '', widthMm: 35, heightMm: 45 }}
            adjustments={adjustments}
            onChange={setAdjustments}
          />
          <button onClick={() => setStep('size')} className="btn-primary">
            Continuar
          </button>
        </div>
      )}

      {step === 'size' && (
        <div className="flex flex-col gap-5">
          <PhotoSizeSelector selected={size} onSelect={handleSizeSelect} />
          {lowResWarning && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
              {lowResWarning}
            </p>
          )}
          <button onClick={goToPrintStep} className="btn-primary" disabled={!size || rendering}>
            {rendering ? 'A preparar…' : 'Continuar'}
          </button>
        </div>
      )}

      {step === 'print' && size && finalCropDataUrl && (
        <div className="flex flex-col gap-6">
          <PrintLayoutSelector selected={printFormat} onSelect={setPrintFormat} />
          {printFormat && (
            <div className="card p-4">
              <PrintPreview photoDataUrl={finalCropDataUrl} size={size} printFormat={printFormat} />
            </div>
          )}
          <button onClick={goToResult} className="btn-primary" disabled={!printFormat || rendering}>
            {rendering ? 'A preparar…' : 'Pré-visualizar e gerar'}
          </button>
        </div>
      )}

      {step === 'result' && size && printFormat && finalCropDataUrl && (
        <ResultPage
          photoDataUrl={finalCropDataUrl}
          size={size}
          printFormat={printFormat}
          onEditAgain={() => setStep('adjust')}
          onNewProject={resetAll}
        />
      )}
    </div>
  );
}

function prevStep(step: WizardStep): WizardStep {
  const order: WizardStep[] = ['home', 'upload', 'background', 'adjust', 'size', 'print', 'result'];
  const idx = order.indexOf(step);
  return idx > 0 ? order[idx - 1] : 'home';
}

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { removeBackground, BackgroundRemovalError } from '../lib/backgroundRemoval';
import type { BackgroundRemovalStatus } from '../types';

interface Props {
  file: File;
  onDone: (transparentDataUrl: string) => void;
  status: BackgroundRemovalStatus;
  setStatus: (s: BackgroundRemovalStatus) => void;
  error: string | null;
  setError: (e: string | null) => void;
}

export function BackgroundRemover({ file, onDone, status, setStatus, error, setError }: Props) {
  const [progressMessage, setProgressMessage] = useState('A preparar…');
  const startedFor = useRef<File | null>(null);

  useEffect(() => {
    if (startedFor.current === file) return;
    startedFor.current = file;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  async function run() {
    setStatus('processing');
    setError(null);
    try {
      const result = await removeBackground(file, setProgressMessage);
      setStatus('done');
      onDone(result);
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof BackgroundRemovalError
          ? err.message
          : 'Ocorreu um erro inesperado ao remover o fundo.'
      );
    }
  }

  if (status === 'processing') {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <Loader2 className="animate-spin text-stamp-600" size={28} />
        <p className="font-medium text-ink-700">Processando…</p>
        <p className="text-xs text-ink-300">{progressMessage}</p>
        <p className="text-xs text-ink-300">
          Na primeira utilização, o modelo de segmentação é descarregado — pode demorar um
          pouco mais.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="card flex flex-col items-center gap-3 border-red-200 p-10 text-center">
        <AlertTriangle className="text-red-600" size={28} />
        <p className="font-medium text-red-700">Erro ao remover fundo</p>
        <p className="text-sm text-ink-500">{error}</p>
        <button onClick={run} className="btn-secondary">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center">
      <CheckCircle2 className="text-stamp-600" size={28} />
      <p className="font-medium text-ink-700">Fundo removido</p>
    </div>
  );
}

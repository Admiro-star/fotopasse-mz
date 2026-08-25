import type { WizardStep } from '../types';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'upload', label: 'Foto' },
  { id: 'background', label: 'Fundo' },
  { id: 'adjust', label: 'Ajustar' },
  { id: 'size', label: 'Tamanho' },
  { id: 'print', label: 'Impressão' },
  { id: 'result', label: 'Baixar' },
];

export function ProgressBar({ current }: { current: WizardStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  if (currentIndex === -1) return null;

  return (
    <ol className="flex w-full items-center justify-between gap-1 px-1" aria-label="Progresso">
      {STEPS.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo';
        return (
          <li key={step.id} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ' +
                (state === 'done'
                  ? 'bg-stamp-600 text-white'
                  : state === 'active'
                  ? 'bg-seal-500 text-white'
                  : 'bg-ink-100 text-ink-500')
              }
              aria-current={state === 'active' ? 'step' : undefined}
            >
              {i + 1}
            </div>
            <span
              className={
                'text-[10px] font-medium sm:text-xs ' +
                (state === 'todo' ? 'text-ink-300' : 'text-ink-700')
              }
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

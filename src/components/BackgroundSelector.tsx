import type { BackgroundOption } from '../types';

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'white', label: 'Branco', color: '#ffffff' },
  { id: 'light-blue', label: 'Azul-claro', color: '#cfe4f2' },
  { id: 'light-gray', label: 'Cinza-claro', color: '#e3e3e0' },
  { id: 'formal-blue', label: 'Azul formal', color: '#3a6b96' },
  { id: 'cream', label: 'Creme / off-white', color: '#f2e9d8' },
  // Arquitetura preparada para mais opções (cores, imagens, fundo
  // personalizado) — basta acrescentar entradas aqui ou permitir
  // que o utilizador escolha uma cor livre.
];

export function BackgroundSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (option: BackgroundOption) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Escolha o fundo</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {BACKGROUND_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt)}
            className={
              'flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-colors ' +
              (selectedId === opt.id ? 'border-stamp-600' : 'border-transparent')
            }
          >
            <span
              className="h-14 w-14 rounded-lg border border-ink-100 shadow-inner"
              style={{ backgroundColor: opt.color }}
            />
            <span className="text-center text-[11px] font-medium text-ink-700">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

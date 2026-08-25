import type { PrintFormatId } from '../types';

const OPTIONS: { id: PrintFormatId; title: string; desc: string }[] = [
  { id: 'single', title: 'Foto individual', desc: 'Uma fotografia no tamanho selecionado' },
  { id: 'sheet6', title: '6 fotos', desc: 'Folha com exatamente 6 fotografias' },
  { id: 'a4', title: 'Folha A4 completa', desc: '210 × 297 mm — quantidade calculada automaticamente' },
  { id: 'a5', title: 'Folha A5', desc: '148 × 210 mm — quantidade calculada automaticamente' },
];

export function PrintLayoutSelector({
  selected,
  onSelect,
}: {
  selected: PrintFormatId | null;
  onSelect: (id: PrintFormatId) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
        Como deseja imprimir?
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={
              'card flex flex-col gap-1 p-5 text-left ' +
              (selected === opt.id ? 'border-2 border-stamp-600' : '')
            }
          >
            <span className="font-display text-base font-semibold text-ink-900">{opt.title}</span>
            <span className="text-sm text-ink-500">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { PhotoSizeMm } from '../types';

export const STANDARD_SIZES: PhotoSizeMm[] = [
  { id: 'passport-mz', label: 'Passaporte Moçambique (35×45 mm)', widthMm: 35, heightMm: 45 },
  { id: 'tipo-passe-3x4', label: 'Tipo passe 3×4 (30×40 mm)', widthMm: 30, heightMm: 40 },
];

export function PhotoSizeSelector({
  selected,
  onSelect,
}: {
  selected: PhotoSizeMm | null;
  onSelect: (size: PhotoSizeMm) => void;
}) {
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');
  const isCustomSelected = selected?.id === 'custom';

  function applyCustom() {
    const w = parseFloat(customW);
    const h = parseFloat(customH);
    if (!w || !h || w <= 0 || h <= 0) return;
    onSelect({ id: 'custom', label: `Personalizado (${w}×${h} mm)`, widthMm: w, heightMm: h });
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold text-ink-900">
        Escolha o tamanho da fotografia
      </h2>
      {STANDARD_SIZES.map((size) => (
        <button
          key={size.id}
          onClick={() => onSelect(size)}
          className={
            'card flex items-center justify-between p-4 text-left ' +
            (selected?.id === size.id ? 'border-2 border-stamp-600' : '')
          }
        >
          <span className="font-medium text-ink-700">{size.label}</span>
          <span
            className="rounded border border-ink-200 bg-ink-50"
            style={{ width: 28, height: (28 * size.heightMm) / size.widthMm }}
          />
        </button>
      ))}

      <div className={'card p-4 ' + (isCustomSelected ? 'border-2 border-stamp-600' : '')}>
        <p className="mb-2 font-medium text-ink-700">Personalizado</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Largura (mm)"
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
            className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm"
          />
          <span className="text-ink-300">×</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Altura (mm)"
            value={customH}
            onChange={(e) => setCustomH(e.target.value)}
            className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm"
          />
        </div>
        <button onClick={applyCustom} className="btn-secondary mt-3 w-full text-sm">
          Usar tamanho personalizado
        </button>
      </div>
    </div>
  );
}

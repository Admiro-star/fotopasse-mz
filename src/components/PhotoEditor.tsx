import { useRef, useState } from 'react';
import { RotateCcw, Wand2 } from 'lucide-react';
import type { EditorAdjustments, PhotoSizeMm } from '../types';
import { DEFAULT_ADJUSTMENTS } from '../types';
import { buildCssFilter } from '../lib/imageUtils';

interface Props {
  imageSrc: string;
  size: PhotoSizeMm;
  adjustments: EditorAdjustments;
  onChange: (a: EditorAdjustments) => void;
}

export function PhotoEditor({ imageSrc, size, adjustments, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const ratio = size.widthMm / size.heightMm;

  function update(partial: Partial<EditorAdjustments>) {
    onChange({ ...adjustments, ...partial });
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    dragState.current = { x: e.clientX, y: e.clientY };
    update({ offsetX: adjustments.offsetX - dx, offsetY: adjustments.offsetY - dy });
  }

  function onPointerUp() {
    dragState.current = null;
    setIsDragging(false);
  }

  function autoEnhance() {
    update({ brightness: 6, contrast: 8, saturation: 4, sharpness: 20 });
  }

  function resetFraming() {
    onChange({ ...DEFAULT_ADJUSTMENTS, brightness: adjustments.brightness, contrast: adjustments.contrast, saturation: adjustments.saturation, sharpness: adjustments.sharpness });
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="relative mx-auto w-full max-w-xs touch-none overflow-hidden rounded-xl border border-ink-100 bg-ink-900"
        style={{ aspectRatio: `${ratio}` }}
      >
        <img
          src={imageSrc}
          alt="Pré-visualização para enquadramento"
          draggable={false}
          className="absolute left-1/2 top-1/2 max-w-none select-none"
          style={{
            transform: `translate(-50%, -50%) translate(${-adjustments.offsetX}px, ${-adjustments.offsetY}px) scale(${adjustments.zoom})`,
            filter: buildCssFilter(adjustments),
            cursor: isDragging ? 'grabbing' : 'grab',
            width: '100%',
          }}
        />
        {/* Guia de enquadramento — não faz parte da imagem exportada */}
        <div className="pointer-events-none absolute inset-2 rounded-md border-2 border-white/70" />
      </div>

      <div className="flex gap-2">
        <button onClick={resetFraming} className="btn-secondary flex-1 text-sm">
          <RotateCcw size={16} /> Repor enquadramento
        </button>
        <button onClick={autoEnhance} className="btn-secondary flex-1 text-sm">
          <Wand2 size={16} /> Aplicar automaticamente
        </button>
      </div>

      <Slider label="Zoom" value={adjustments.zoom} min={1} max={2.5} step={0.01} onChange={(v) => update({ zoom: v })} />
      <div className="grid grid-cols-3 gap-3">
        <Slider label="Brilho" value={adjustments.brightness} min={-40} max={40} step={1} onChange={(v) => update({ brightness: v })} />
        <Slider label="Contraste" value={adjustments.contrast} min={-40} max={40} step={1} onChange={(v) => update({ contrast: v })} />
        <Slider label="Saturação" value={adjustments.saturation} min={-40} max={40} step={1} onChange={(v) => update({ saturation: v })} />
      </div>
      <Slider label="Nitidez" value={adjustments.sharpness} min={0} max={100} step={1} onChange={(v) => update({ sharpness: v })} />
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-ink-500">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="accent-stamp-600"
      />
    </label>
  );
}

import { useCallback, useRef, useState } from 'react';
import { Camera, ImagePlus, Upload } from 'lucide-react';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function UploadPhoto({ onSelect }: { onSelect: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        setError('Formato não suportado. Utilize JPG, PNG ou WEBP.');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setError('A imagem é demasiado grande (máx. 25MB).');
        return;
      }
      setError(null);
      onSelect(file);
    },
    [onSelect]
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          validateAndSelect(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        className={
          'card flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed p-10 text-center transition-colors ' +
          (isDragging ? 'border-stamp-500 bg-stamp-50' : 'border-ink-100')
        }
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-50 text-ink-700">
          <ImagePlus size={26} />
        </div>
        <p className="font-medium text-ink-700">Toque para escolher uma fotografia</p>
        <p className="text-xs text-ink-300">ou arraste e solte aqui · JPG, PNG, WEBP</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => validateAndSelect(e.target.files?.[0])}
        />
      </div>

      <button onClick={() => cameraInputRef.current?.click()} className="btn-secondary">
        <Camera size={18} />
        Usar a câmara do telemóvel
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => validateAndSelect(e.target.files?.[0])}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <p className="flex items-center gap-1.5 text-xs text-ink-300">
        <Upload size={13} />
        As suas fotografias são utilizadas apenas para processamento. Não partilhe fotografias
        sem autorização.
      </p>
    </div>
  );
}

import { Camera, ShieldCheck, Stamp } from 'lucide-react';

export function Home({ onStart, onAbout }: { onStart: () => void; onAbout: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-5 py-10 sm:max-w-lg">
      <header className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-seal-400">
          <Stamp size={20} />
        </div>
        <span className="font-display text-xl font-semibold text-ink-900">FotoPasse MZ</span>
      </header>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
          Transforme a sua fotografia numa foto tipo passe pronta para imprimir.
        </h1>
        <p className="text-ink-500">
          Carregue uma foto, escolha o fundo formal, ajuste o enquadramento e receba um PDF
          pronto para a impressora — no tamanho exato exigido para documentos.
        </p>
      </div>

      <button onClick={onStart} className="btn-primary text-base">
        <Camera size={18} />
        Começar agora
      </button>

      <ul className="grid grid-cols-1 gap-3 text-sm text-ink-500 sm:grid-cols-3">
        <li className="card flex flex-col gap-1 p-4">
          <span className="font-display text-ink-900">35×45 / 30×40 mm</span>
          Tamanhos oficiais moçambicanos
        </li>
        <li className="card flex flex-col gap-1 p-4">
          <span className="font-display text-ink-900">300 DPI</span>
          Qualidade real de impressão
        </li>
        <li className="card flex flex-col gap-1 p-4 sm:col-span-1">
          <span className="font-display text-ink-900 flex items-center gap-1">
            <ShieldCheck size={16} /> Privacidade
          </span>
          Processamento local sempre que possível
        </li>
      </ul>

      <button onClick={onAbout} className="text-sm text-ink-500 underline underline-offset-2">
        Sobre o FotoPasse MZ
      </button>
    </div>
  );
}

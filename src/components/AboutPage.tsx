export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-5 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Sobre o FotoPasse MZ</h1>
      <p className="text-ink-500">
        O FotoPasse MZ foi criado para facilitar a preparação de fotografias para documentos e
        impressão — passaporte, BI, cartões e outros documentos oficiais moçambicanos — sem
        necessidade de um estúdio fotográfico.
      </p>
      <p className="text-ink-500">
        A remoção de fundo e o recorte acontecem diretamente no seu telemóvel ou computador
        sempre que possível, e o PDF final é gerado com as dimensões físicas exatas exigidas
        para impressão.
      </p>
      <button onClick={onBack} className="btn-secondary self-start">
        Voltar
      </button>
    </div>
  );
}

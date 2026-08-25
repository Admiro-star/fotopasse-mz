/**
 * Remoção de fundo REAL.
 *
 * Estratégia primária: @imgly/background-removal corre inteiramente no
 * browser (WASM + modelo ONNX carregado via CDN na primeira utilização),
 * sem exigir chave de API nem backend. Preserva cabelo/contornos com um
 * modelo de segmentação dedicado — não é uma simulação.
 *
 * Estratégia alternativa (configurável): se preferir usar um serviço externo
 * (ex.: remove.bg) por qualidade superior em fundos complexos, defina
 * VITE_BG_REMOVAL_PROVIDER=api e VITE_BG_REMOVAL_ENDPOINT no ficheiro .env —
 * o pedido é feito a partir do SEU backend (ver server/README.md), nunca
 * expondo a chave no frontend. Sem essa configuração, usa-se sempre o
 * processamento local.
 */

export type BgRemovalProvider = 'local' | 'api';

export interface BgRemovalConfig {
  provider: BgRemovalProvider;
  apiEndpoint?: string; // endpoint do SEU backend, nunca a API externa diretamente
}

export function getBgRemovalConfig(): BgRemovalConfig {
  const provider = (import.meta.env.VITE_BG_REMOVAL_PROVIDER as BgRemovalProvider) || 'local';
  const apiEndpoint = import.meta.env.VITE_BG_REMOVAL_ENDPOINT as string | undefined;
  return { provider, apiEndpoint };
}

export class BackgroundRemovalError extends Error {}

export async function removeBackground(
  file: File | Blob,
  onProgress?: (message: string) => void
): Promise<string> {
  const config = getBgRemovalConfig();

  if (config.provider === 'api') {
    if (!config.apiEndpoint) {
      throw new BackgroundRemovalError(
        'VITE_BG_REMOVAL_PROVIDER está definido como "api" mas falta VITE_BG_REMOVAL_ENDPOINT. Configure o endpoint do seu backend.'
      );
    }
    return removeBackgroundViaApi(file, config.apiEndpoint);
  }

  return removeBackgroundLocally(file, onProgress);
}

async function removeBackgroundLocally(
  file: File | Blob,
  onProgress?: (message: string) => void
): Promise<string> {
  try {
    onProgress?.('A carregar modelo de segmentação…');
    // Import dinâmico: o modelo (~vários MB) só é descarregado quando necessário
    const { removeBackground: imglyRemove } = await import(
      '@imgly/background-removal'
    );

    onProgress?.('A remover o fundo…');
    const resultBlob = await imglyRemove(file, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100);
          onProgress?.(`${describeStage(key)} ${pct}%`);
        }
      },
    });

    return await blobToDataUrl(resultBlob);
  } catch (err) {
    console.error('Falha na remoção local de fundo:', err);
    throw new BackgroundRemovalError(
      'Não foi possível remover o fundo automaticamente no navegador. Verifique a sua ligação à internet (o modelo é descarregado na primeira utilização) ou tente novamente.'
    );
  }
}

async function removeBackgroundViaApi(
  file: File | Blob,
  endpoint: string
): Promise<string> {
  const form = new FormData();
  form.append('image', file);

  let response: Response;
  try {
    response = await fetch(endpoint, { method: 'POST', body: form });
  } catch (err) {
    throw new BackgroundRemovalError(
      'Não foi possível contactar o serviço de remoção de fundo. Verifique a sua ligação à internet.'
    );
  }

  if (!response.ok) {
    throw new BackgroundRemovalError(
      `O serviço de remoção de fundo respondeu com erro (${response.status}). Tente novamente mais tarde.`
    );
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function describeStage(key: string): string {
  if (key.includes('fetch')) return 'A descarregar modelo…';
  if (key.includes('inference')) return 'A analisar a fotografia…';
  return 'A processar…';
}

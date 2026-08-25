# FotoPasse MZ

Aplicação web para transformar uma fotografia numa foto tipo passe pronta
para imprimir: remove o fundo, aplica um fundo formal, ajusta o
enquadramento e gera um PDF com dimensões físicas corretas (mm, 300 DPI).

## Como correr localmente

Precisa de **Node.js 18+** e ligação à internet (para instalar pacotes e,
na primeira utilização da remoção de fundo, descarregar o modelo).

```bash
npm install
npm run dev
```

Abra o endereço apresentado no terminal. Para testar no telemóvel, ligue-o
à mesma rede Wi-Fi do computador e aceda a `http://<IP-do-computador>:5173`.

Build de produção:

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
  components/     UploadPhoto, BackgroundRemover, BackgroundSelector,
                   PhotoEditor, PhotoSizeSelector, PrintLayoutSelector,
                   PrintPreview, ResultPage, AboutPage, ProgressBar, Home
  lib/
    layoutCalculator.ts   calculatePhotoLayout() — algoritmo de distribuição
    pdfGenerator.ts       geração do PDF real (jsPDF, unidades em mm)
    backgroundRemoval.ts  remoção de fundo real (local ou via API própria)
    imageUtils.ts         composição, recorte, filtros, verificação de DPI
  App.tsx           orquestra o assistente passo a passo
server/             backend opcional para usar uma API externa de remoção
                     de fundo em vez do processamento local
```

## Estado real de cada funcionalidade

**Totalmente implementado e funcional (não simulado):**
- Carregar foto (seleção, arrastar/soltar, câmara do telemóvel)
- Remoção de fundo real, local, no navegador (`@imgly/background-removal`,
  sem chave de API)
- Aplicação de 5 fundos formais, compositados em canvas
- Editor com zoom/deslocamento/brilho/contraste/saturação/nitidez
- Tamanhos: passaporte MZ (35×45), tipo passe (30×40), personalizado
- `calculatePhotoLayout()` — algoritmo genérico de distribuição em folha,
  testando as duas orientações e maximizando o aproveitamento
- Pré-visualização de impressão à escala, com alternância de orientação
- Geração real de PDF (jsPDF) com tamanho físico de página correto,
  imagens posicionadas em milímetros — abre corretamente em leitores de
  PDF e imprime no tamanho físico exato
- Download de JPG/PNG
- Aviso de baixa resolução comparando os pixels da foto original com os
  pixels necessários a 300 DPI
- Mensagem de privacidade; nenhuma foto é enviada a um servidor a não ser
  que ative o modo de API externa

**Depende de configuração/rede:**
- Na primeira utilização, a remoção local de fundo descarrega um modelo
  (alguns MB) — precisa de internet nesse momento; depois funciona offline.
- O modo alternativo "API externa" (`VITE_BG_REMOVAL_PROVIDER=api`) requer
  que você implemente/aloje o backend de exemplo em `server/` com a sua
  própria chave — nunca ponha a chave no frontend.

**Preparado mas não implementado no MVP (conforme pedido):**
- Sistema de contas/projetos guardados (arquitetura permite adicionar
  depois; MVP funciona sem login)
- Mais fundos, imagens de fundo ou fundo personalizado (fácil de
  acrescentar em `BackgroundSelector.tsx`)

**Importante — não pude executar `npm install`/testar no browser aqui:**
Este ambiente de geração de código não tem acesso à internet, por isso não
consegui correr `npm install`, `npm run build` nem abrir a aplicação num
browser real para capturar screenshots. O código foi escrito com cuidado e
segue as APIs reais das bibliotecas (`jspdf`, `@imgly/background-removal`,
`lucide-react`), mas recomendo fortemente correr `npm run dev` e percorrer
os 10 testes da secção 22 do seu pedido antes de confiar no resultado —
sobretudo a geração do PDF final e a remoção de fundo em fotos reais.

## Sobre o futuro APK (Capacitor)

O projeto já é mobile-first e não depende de nada exclusivo de desktop.
Para embalar como APK mais tarde:

```bash
npm install @capacitor/core @capacitor/android
npx cap init "FotoPasse MZ" "mz.fotopasse.app"
npm run build
npx cap add android
npx cap copy
npx cap open android
```

Um único ponto de atenção: `@imgly/background-removal` corre com WASM/ONNX
dentro do WebView — funciona no Capacitor, mas vale testar o tempo de
carregamento do modelo num telemóvel de gama média antes de lançar.

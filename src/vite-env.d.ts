/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BG_REMOVAL_PROVIDER?: 'local' | 'api';
  readonly VITE_BG_REMOVAL_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
